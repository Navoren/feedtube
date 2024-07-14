import { z } from 'zod';

export const messageSchema = z.object({
    content: z
        .string()
        .min(2, "Message must be at least 2 characters")
        .max(500, "Message must be at most 500 characters"),
    
});