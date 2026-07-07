import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
