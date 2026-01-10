import { JwtPayload } from 'jsonwebtoken'
import { IMessage, IMessageFilterables } from './message.interface'
import { User } from '../user/user.model'
import { USER_STATUS } from '../../../enum/user'
import { Message } from './message.model'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interfaces/response'
import { IUser } from '../user/user.interface'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { sendNotification } from '../../../helpers/notificationHelper'
import { emitEvent } from '../../../helpers/socketInstances'

const sendMessageToRandomUserOptimized = async (
  user: JwtPayload,
  payload: Partial<IMessage>,
) => {
  try {
    payload.sender = user.authId

    const result = await User.aggregate([
      {
        $match: {
          _id: { $ne: user.authId },
          status: USER_STATUS.ACTIVE,
        },
      },
      { $sample: { size: 1 } },
      {
        $project: {
          _id: 1,
        },
      },
    ])

    if (result.length === 0) {
      return { success: false, error: 'No other users available' }
    }

    const randomUser = result[0]

    const message = await Message.create({
      ...payload,
      receiver: randomUser._id,
    })

    //send notification to the receiver
    await sendNotification(
      {
        authId: user._id,
        name: user.name,
        profile: user.profile,
      },
      randomUser._id,
      `${user.name} sent you a message`,
      `${message.message}`,
    )

    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: 'sender',
        select: 'firstName lastName profile',
      })
      .populate({
        path: 'receiver',
        select: 'firstName lastName profile',
      })
      .lean()

    emitEvent(`message:${randomUser._id}`, populatedMessage)

    return `Message sent successfully.`
  } catch (error) {
    console.error('Error sending optimized message to random user:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

const getMyMessages = async (
  user: JwtPayload,
  pagination: IPaginationOptions,
  filters: IMessageFilterables,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const { isInbox } = filters

  const messageCondition = isInbox
    ? { receiver: user.authId }
    : {
        $or: [{ receiver: user.authId }, { sender: user.authId }],
      }

  const [messages, total] = await Promise.all([
    Message.find(messageCondition)
      .populate<{ sender: Partial<IUser> }>({
        path: 'sender',
        select: 'firstName lastName profile',
      })
      .populate<{ receiver: Partial<IUser> }>({
        path: 'receiver',
        select: 'firstName lastName profile',
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),

    Message.countDocuments(messageCondition),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: messages ?? [],
  }
}

const getMessageByUserId = async (
  userId: string,
  pagination: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)
  const [messages, total] = await Promise.all([
    Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate<{ sender: Partial<IUser> }>({
        path: 'sender',
        select: 'firstName lastName profile',
      })
      .populate<{ receiver: Partial<IUser> }>({
        path: 'receiver',
        select: 'firstName lastName profile',
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
    }),
  ])
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: messages || [],
  }
}

const getFeedMessages = async (
  user: JwtPayload,
  pagination: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)
  const [messages, total] = await Promise.all([
    Message.find({
      isShared: true,
      deletedBy: { $size: 0 },
    })
      .populate<{ sender: Partial<IUser> }>({
        path: 'sender',
        select: 'firstName lastName profile',
      })
      .populate<{ receiver: Partial<IUser> }>({
        path: 'receiver',
        select: 'firstName lastName profile',
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({
      isShared: true,
      deletedBy: { $size: 0 },
    }),
  ])
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: messages || [],
  }
}

const shareMessage = async (user: JwtPayload, messageId: string) => {
  const message = await Message.findById(messageId)
  if (!message) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'The message you are trying to share does not exist.',
    )
  }
  // if (!message.deletedBy.includes(message.sender)) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'The message you are trying to share has been deleted.');
  // }
  if (message.isShared) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The message you are trying to share is already shared.',
    )
  }
  if (message.receiver.toString() !== user.authId.toString()) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to share this message.',
    )
  }
  message.isShared = true
  await message.save()
  return `Message shared successfully.`
}

export const MessageServices = {
  sendMessageToRandomUserOptimized,
  getMyMessages,
  getMessageByUserId,
  getFeedMessages,
  shareMessage,
}
