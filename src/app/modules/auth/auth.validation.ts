import { z } from 'zod'
import { USER_ROLES } from '../../../enum/user'

const verifyEmailOrPhoneOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const forgetPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
  }),
})

const resetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm Password is required' }),
  }),
})

const loginZodSchema = z.object({
  body: z.object({
    userName: z
      .string({ required_error: 'User name is required' }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    deviceToken: z.string().min(1).optional(),
    password: z.string().min(6, { message: 'Password is required' }),
  }),
})

const adminLoginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password is required' }),
  }),
})

const verifyAccountZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const resendOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
      authType:z.string(z.enum(['resetPassword','createAccount']).optional())
  }),
})

const changePasswordZodSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),
      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
})

const deleteAccount = z.object({
  body: z
    .object({
    password: z.string({
      required_error: 'Password is required',
    })
   })
    
})

const createUserZodSchema = z.object({
  body: z.object({
  email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    userName: z.string({ required_error: 'User Name is required' }),
    firstName: z.string({ required_error: 'First Name is required' }),
    lastName: z.string({ required_error: 'Last Name is required' }),
    category: z.enum(['Lifelong Learner / Student', 'Working Professional', 'Parent / Caregiver', 'Partnered / Navigating Relationships', 'Independent / Navigating Life', 'In Transition / Redefining Myself']),
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

const socialLoginZodSchema = z.object({
  body: z.object({
    appId: z.string({ required_error: 'App ID is required' }),
    deviceToken: z.string({ required_error: 'Device token is required' }),
  }),
})

const toggleUserStatusZodSchema = z.object({
  params: z.object({
    userId: z.string({ required_error: 'User ID is required' }),
  }),
})

export const AuthValidations = {
  verifyEmailOrPhoneOtpZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
  loginZodSchema,
  verifyAccountZodSchema,
  resendOtpZodSchema,
  changePasswordZodSchema,
  createUserZodSchema,
  deleteAccount,
  socialLoginZodSchema,
  adminLoginZodSchema,
  toggleUserStatusZodSchema,
}
