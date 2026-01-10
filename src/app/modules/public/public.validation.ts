import { z } from 'zod'

const contactZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    phone: z.string({
      required_error: 'Phone number is required',
    }),
    country: z.string({
      required_error: 'Country is required',
    }),
    message: z.string({
      required_error: 'Message is required',
    }),
  }),
})

export const PublicValidation = {
  create: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition','contact','about']),
    }),
  }),

  update: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition','contact','about']),
    }),
  }),
  contactZodSchema,
}

export const FaqValidations = {
  create: z.object({
    body: z.object({
      question: z.string(),
      answer: z.string(),
    }),
  }),

  update: z.object({
    body: z.object({
      question: z.string().optional(),
      answer: z.string().optional(),
    }),
  }),
}
