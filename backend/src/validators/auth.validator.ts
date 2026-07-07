import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
