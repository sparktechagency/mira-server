import { Request, Response } from 'express'
import { MessageServices } from './message.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'
import { messageFilterables } from './message.constants'
import { paginationFields } from '../../../interfaces/pagination'

const sendMessageToRandomUserOptimized = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user
    const payload = req.body
    const result = await MessageServices.sendMessageToRandomUserOptimized(
      user!,
      payload,
    )
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Message sent successfully',
      data: result,
    })
  },
)

const getMyMessages = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const paginationOptions = pick(req.query, paginationFields)
  const filters = pick(req.query, messageFilterables)
  const result = await MessageServices.getMyMessages(user!, paginationOptions, filters)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages fetched successfully',
    data: result,
  })
})

const getFeedMessages = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const paginationOptions = pick(req.query, paginationFields)
  const result = await MessageServices.getFeedMessages(user!, paginationOptions)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages fetched successfully',
    data: result,
  })
})

const shareMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { messageId } = req.params
  const result = await MessageServices.shareMessage(user!, messageId)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message shared successfully',
    data: result,
  })
})

export const MessageController = {
  sendMessageToRandomUserOptimized,
  getMyMessages,
  getFeedMessages,
  shareMessage,
}
