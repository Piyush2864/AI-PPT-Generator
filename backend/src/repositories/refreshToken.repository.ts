import { prisma } from '../config/prisma';

export class RefreshTokenRepository {
  create(params: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  findByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  findById(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  }

  revoke(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
