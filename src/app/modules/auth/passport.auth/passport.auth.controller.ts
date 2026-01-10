import { Request, Response } from 'express'
import catchAsync from '../../../../shared/catchAsync'
import sendResponse from '../../../../shared/sendResponse'
import { IUser } from '../../user/user.interface'
import { StatusCodes } from 'http-status-codes'
import { ILoginResponse } from '../../../../interfaces/response'
import { PassportAuthServices } from './passport.auth.service'
import { AuthCommonServices } from '../common'

const login = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { deviceToken, password } = req.body

  const result = await AuthCommonServices.handleLoginLogic(
    { deviceToken: deviceToken, password: password },
    user as IUser,
  )
  const {status, message, accessToken, refreshToken, role} = result

  sendResponse<ILoginResponse>(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})

const googleAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const result = await PassportAuthServices.handleGoogleLogin(
    req.user as IUser & { profile: any },
  )
  const {status, message, accessToken, refreshToken, role} = result
  sendResponse(res, {
    statusCode: status,
    success: true,
    message: message,
    data: {accessToken, refreshToken, role},
  })
})

export const PassportAuthController = {
  login,
  googleAuthCallback,
}
