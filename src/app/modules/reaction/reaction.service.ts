import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Reaction } from './reaction.model';
import { JwtPayload } from 'jsonwebtoken';

import mongoose, { Types } from 'mongoose';
import { Message } from '../message/message.model';
import { sendNotification } from '../../../helpers/notificationHelper';
import { emitEvent } from '../../../helpers/socketInstances';

const toggleReaction = async (
 user:JwtPayload,
 messageId:Types.ObjectId
) => {

  const session =await mongoose.startSession();
  session.startTransaction();
  let message;
  let sendNotificaiton = false;
  try {
    const existingReaction = await Reaction.findOne({
      message: messageId,
      user: user.authId,
    });
    if(existingReaction){
     const [deletedReaction,updatedMessage] = await Promise.all([
        await existingReaction.deleteOne({session}),
        await Message.findByIdAndUpdate(messageId,{
          $inc:{
            reactionCount:-1
          }
        },{session})
      ])

      emitEvent('messageFeedUpdate',{
      message:messageId.toString(),
      type:'reaction:remove',
      data:existingReaction.toObject(),
    }, messageId.toString())

      message = updatedMessage;
    }else{
      const [createdReaction,updatedMessage] = await Promise.all([
        await Reaction.create([{
          message: messageId,
          user: user.authId,
        }],{session}),
        await Message.findByIdAndUpdate(messageId,{
          $inc:{
            reactionCount:1
          }
        },{session})
      ])
      message = updatedMessage;
      sendNotificaiton = true;
      emitEvent('messageFeedUpdate',{
        message:messageId.toString(),
        type:'reaction:create',
        data:createdReaction[0],
      }, messageId.toString())

    }
    await session.commitTransaction();


    //notification
    if(sendNotificaiton){
       const notificationData = {
      from:{
        authId:user.authId.toString(),
        name:user.name,
        profilePhoto:user.profile?.toString(),
      },
      to:message?.sender.toString(),
      title:`reacted to your message`,
      body:`reacted to your message`,
    }
      await sendNotification(notificationData.from, notificationData.to!, notificationData.title, notificationData.body);
    }

    return existingReaction ? 'unreacted' : 'reacted';
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to toggle reaction');
  }finally{
    await session.endSession();
  }
}


const getReactionList = async (
  messageId:Types.ObjectId
) => {
  const reactionList = await Reaction.find({
    message: messageId,
  }).populate({
    path:'user',
    select:'_id firstName lastName  profile'
  });
  return reactionList || [];
}

export const ReactionServices = {
  toggleReaction,
  getReactionList,
};