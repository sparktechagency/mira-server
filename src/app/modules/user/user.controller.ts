import { Request, Response, NextFunction } from 'express'

import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'

import { UserServices } from './user.service'
import pick from '../../../shared/pick'
import { userFilterableFields } from './user.constants'
import { paginationFields } from '../../../interfaces/pagination'
import { IUser } from './user.interface'

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { images, ...userData } = req.body

  images?.length > 0 && (userData.profile = images[0])

  const result = await UserServices.updateProfile(req.user!, userData)
  sendResponse<IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  })
})

const checkAndGetUserNameAvailablity = catchAsync(
  async (req: Request, res: Response) => {
    const { userName } = req.params
    const result = await UserServices.checkAndGetUserNameAvailablity(userName)
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User Name checked successfully',
      data: result,
    })
  },
)

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getProfile(req.user!)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  })
})

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields)
  const pagination = pick(req.query, paginationFields)

  const result = await UserServices.getAllUsers(req.user!, pagination, filters)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  })
})

export const UserController = {
  checkAndGetUserNameAvailablity,
  updateProfile,
  getProfile,
  getAllUsers,
}
