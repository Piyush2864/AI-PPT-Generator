import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';


export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }
}

export const userRepository = new UserRepository();
