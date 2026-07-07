import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { AppError } from '../utils/AppError';
import { createChildLogger } from '../config/logger';
import type { UpdateProfileInput, ChangePasswordInput } from '../validators/User.validator';

const logger = createChildLogger('user-service');

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.updateById(userId, { name: input.name });
    logger.info({ userId }, 'User profile updated');
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) throw AppError.badRequest('Current password is incorrect');

    const newHash = await bcrypt.hash(input.newPassword, 10);
    await userRepository.updateById(userId, { passwordHash: newHash });

    // Revoke all refresh tokens so all other sessions are logged out after a password change.
    await refreshTokenRepository.revokeAllForUser(userId);

    logger.info({ userId }, 'User password changed - all sessions revoked');
  }

  async deleteAccount(userId: string, password: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw AppError.badRequest('Incorrect password');

    // Cascade deletes all presentations, slides, job logs, refresh tokens (defined in schema)
    await userRepository.deleteById(userId);
    logger.info({ userId }, 'User account deleted');
  }
}

export const userService = new UserService();