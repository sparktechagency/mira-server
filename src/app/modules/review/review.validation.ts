import { z } from 'zod';

export const ReviewValidations = {
  create: z.object({
    body: z.object({
      reviewee: z.string(),
      rating: z.number(),
      review: z.string().optional(),
    }),
  }),

  update: z.object({
    body: z.object({
      reviewee: z.string().optional(),
      rating: z.number().optional(),
      review: z.string().optional(),
    }),
  }),
};
