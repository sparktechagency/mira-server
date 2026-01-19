import { Request, Response } from 'express'
import catchAsync from '../../../../shared/catchAsync'
import { CustomAuthServices } from './custom.auth.service'
import sendResponse from '../../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'

const customLogin = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body

  const result = await CustomAuthServices.customLogin(loginData)
  const {status, message, accessToken, refreshToken, role} = result

  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})
const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body

  const result = await CustomAuthServices.googleLoginService(loginData)
  const {status, message, accessToken, refreshToken, role} = result

  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})

const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body

  const result = await CustomAuthServices.adminLogin(loginData)
  const {status, message, accessToken, refreshToken, role} = result

  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, phone } = req.body
  const result = await CustomAuthServices.forgetPassword(email.toLowerCase().trim(), phone)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `An OTP has been sent to your ${email || phone}. Please verify your email.`,
    data: result,
  })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization
  const { ...resetData } = req.body
  const result = await CustomAuthServices.resetPassword(token!, resetData)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully, please login now.',
    data: result,
  })
})

const verifyAccount = catchAsync(async (req: Request, res: Response) => {
  const { oneTimeCode, phone, email } = req.body

  const result = await CustomAuthServices.verifyAccount(email, oneTimeCode)
  const {status, message, accessToken, refreshToken, role, token} = result
  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role, token},
  })
})

const getRefreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  const result = await CustomAuthServices.getRefreshToken(refreshToken)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  })
})

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, phone, authType } = req.body
  const result = await CustomAuthServices.resendOtp(email, authType)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `An OTP has been sent to your ${email || phone}. Please verify your email.`,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const result = await CustomAuthServices.changePassword(
    req.user!,
    currentPassword,
    newPassword,
  )
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  })
})

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body
  const result = await CustomAuthServices.createUser(userData)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  })
})
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const {password} = req.body
  const result = await CustomAuthServices.deleteAccount(user!, password)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Account deleted successfully',
    data: result,
  })
})


const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const { appId, deviceToken } = req.body
  const result = await CustomAuthServices.socialLogin(appId, deviceToken)
  const {status, message, accessToken, refreshToken, role} = result
  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const {userId} = req.params
  const result = await CustomAuthServices.toggleUserStatus(user!, userId)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result,
    data:null
  })
})
export const CustomAuthController = {
  forgetPassword,
  resetPassword,
  verifyAccount,
  customLogin,
  getRefreshToken,
  resendOtp,
  changePassword,
  createUser,
  deleteAccount,
  adminLogin,
  socialLogin,
  toggleUserStatus,
  googleLogin
}
