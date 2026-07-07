import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import ms from '../utils/ms';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashToken } from '../utils/hashToken';
import { env } from '../config/env';
import { createChildLogger } from '../config/logger';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

const logger = createChildLogger('auth-service');

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async signup(input: SignupInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    logger.info({ userId: user.id }, 'New user signed up');

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.toSafeUser(user), ...tokens };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    logger.info({ userId: user.id }, 'User logged in');

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.toSafeUser(user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByHash(tokenHash);

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {

      if (stored?.revoked) {
        await refreshTokenRepository.revokeAllForUser(decoded.userId);
        logger.warn({ userId: decoded.userId }, 'Possible refresh token reuse detected - all sessions revoked');
      }
      throw AppError.unauthorized('Refresh token is no longer valid');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) throw AppError.unauthorized('User no longer exists');

    await refreshTokenRepository.revoke(stored.id);
    return this.issueTokens(user.id, user.email);
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByHash(tokenHash);
    if (stored) await refreshTokenRepository.revoke(stored.id);
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = signAccessToken({ userId, email });

    const tokenId = uuid();
    const refreshToken = signRefreshToken({ userId, tokenId });
    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));

    await refreshTokenRepository.create({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private toSafeUser(user: { id: string; email: string; name: string; createdAt: Date }) {
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  }
}

export const authService = new AuthService();
