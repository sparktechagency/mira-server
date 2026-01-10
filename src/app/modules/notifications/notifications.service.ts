import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'
import { Notification } from './notifications.model'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'



const getNotifications = async (user: JwtPayload, paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions)
  const [result, total] = await Promise.all([
    Notification.find({ to: user.authId })
      .populate('to', 'profile firstName lastName userName')
      .populate('from', 'profile firstName lastName userName')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean(),
    Notification.countDocuments({ to: user.authId }),
  ])
  
    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: result,
    }
}

const readNotification = async (id: string) => {
 try {
    await Notification.findByIdAndUpdate(
      new Types.ObjectId(id),
      { isRead: true },
      { new: true },
    )
    return 'Notification read successfully'
 } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to mark notification as read')
 }
}

const readAllNotifications = async (user: JwtPayload) => {
 try {
    await Notification.updateMany({ to: user.authId }, { isRead: true })
    return 'All notifications read successfully'
 } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to mark all notifications as read')
 }
}

export const NotificationServices = {
  getNotifications,
  readNotification,
  readAllNotifications,
}
