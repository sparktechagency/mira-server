import { z } from 'zod'
import { USER_ROLES } from '../../../enum/user'
import { query } from 'express'


const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    userName: z.string({ required_error: 'User Name is required' }),
    firstName: z.string({ required_error: 'First Name is required' }),
    lastName: z.string({ required_error: 'Last Name is required' }),

    role: z.enum(
      [
        USER_ROLES.USER,
      ],
      {
        message: 'Role must be user',
      },
    ),
  }),
})

const updateUserZodSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
})

const checkUserNameZodSchema = z.object({
  params: z.object({
    userName: z.string({ required_error: 'User Name is required' }).min(2),
  }),
})


export const UserValidations = { createUserZodSchema, updateUserZodSchema, checkUserNameZodSchema }
