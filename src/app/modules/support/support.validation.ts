import { z } from 'zod';

export const SupportValidations = {
  create: z.object({
    body: z.object({
      subject: z.string({ required_error: 'Subject is required' }),
      message: z.string({ required_error: 'Message is required' }),
    }),

  }),

  update: z.object({
    body: z.object({
      subject: z.string().optional(),
      message: z.string().optional(),
    }),
  }),
};
