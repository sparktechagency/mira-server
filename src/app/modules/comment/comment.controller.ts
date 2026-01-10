import { Request, Response } from 'express';
import { CommentServices } from './comment.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { commentFilterables } from './comment.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { Types } from 'mongoose';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const payload = req.body;
  payload.message = messageId;
  const comment = await CommentServices.createComment(req.user!,  req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: comment,
  });
});

const getCommentByMessage = catchAsync(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const paginationOptions = pick(req.query, paginationFields);
  const result = await CommentServices.getCommentByMessage(new Types.ObjectId(messageId), paginationOptions);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Comment fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});
const removeComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  await CommentServices.removeComment(req.user!,new Types.ObjectId(commentId));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Comment removed successfully',
  });
});

const reactForComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  await CommentServices.reactForComment( new Types.ObjectId(commentId),req.user!,);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Comment reacted successfully',
  });
});
export const CommentController = {
  createComment,
  getCommentByMessage,
  removeComment,
  reactForComment,
};