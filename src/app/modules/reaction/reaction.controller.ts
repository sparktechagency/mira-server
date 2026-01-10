import { Request, Response } from 'express';
import { ReactionServices } from './reaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { reactionFilterables } from './reaction.constants';
import { paginationFields } from '../../../interfaces/pagination';
import { Types } from 'mongoose';

const toggleReaction = catchAsync(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const user = req.user;
  const objectId = new Types.ObjectId(messageId);
  const result = await ReactionServices.toggleReaction(
    user!,
    objectId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reaction toggled successfully',
    data: result,
  });
});

const getReactionListByMessage = catchAsync(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const objectId = new Types.ObjectId(messageId);
  const result = await ReactionServices.getReactionList(
    objectId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reaction list fetched successfully',
    data: result,
  });
});


export const ReactionController = {
  toggleReaction,
  getReactionListByMessage,
};