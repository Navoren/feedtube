import { z } from 'zod';

export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must only contain letters, numbers, and underscores");

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    verifyCode: z.string(),
    verifyCodeExpiry: z.date(),
    isVerified: z.boolean(),
    isAcceptingMessages: z.boolean(),
    messages: z.array(z.object({
        content: z.string(),
        createdAt: z.date()
    }))
});