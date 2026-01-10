import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICommentFilterables, IComment } from './comment.interface';
import { Comment } from './comment.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { commentSearchableFields } from './comment.constants';
import mongoose, { Types } from 'mongoose';
import { Message } from '../message/message.model';
import { sendNotification } from '../../../helpers/notificationHelper';
import { emitEvent } from '../../../helpers/socketInstances';

const createComment = async (user: JwtPayload, payload: Partial<IComment>) => {
  payload.user = user.authId;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Create comment and update message within the same transaction
    const createdComment = await Comment.create([payload], { session });
    const message = await Message.findByIdAndUpdate(
      payload.message,
      { $inc: { commentCount: 1 } },
      { session, new: true }
    );
    if (!message) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found.");
    }

    await session.commitTransaction();


    // Build notification payload
    const notificationData = {
      from: {
        authId: user.authId.toString(),
        name: user.name,
        profile: user.profile?.toString(),
      },
      title: `${user.name} commented on your message`,
      body: createdComment[0].content,
    };

    // Send notifications outside the transaction
    const notificationPromises = [];

    if (message?.sender) {
      notificationPromises.push(
        sendNotification(
          notificationData.from,
          message.sender.toString(),
          notificationData.title,
          notificationData.body
        )
      );
    }

    if (message?.isShared && message?.receiver) {
      notificationPromises.push(
        sendNotification(
          notificationData.from,
          message.receiver.toString(),
          notificationData.title,
          notificationData.body
        )
      );
    }

    await Promise.all(notificationPromises);

    const {user:userId, ...restData} = createdComment[0].toObject();
    const newCommnetWithPopulatedData = {
      ...restData,
      user: {
        _id: userId,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1],
        profile: user.profile?.toString(),      },
    }


    emitEvent('messageFeedUpdate',{
      message:message?._id.toString(),
      type:'comment:create',
      data:newCommnetWithPopulatedData,
    }, message?._id.toString())

    

    return `Comment created successfully.`;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create comment, please try again later."
    );
  } finally {
    session.endSession(); // only call endSession once
  }
};


const removeComment = async(user:JwtPayload,commentId:Types.ObjectId)=>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const comment = await Comment.findByIdAndDelete(commentId,{session});
    if(!comment){
      throw new ApiError(StatusCodes.NOT_FOUND,"Comment not found.");
    }

    if(comment.user?.toString() !== user.authId.toString()){
      throw new ApiError(StatusCodes.FORBIDDEN,"You are not authorized to remove this comment.");
    }

    emitEvent('messageFeedUpdate',{
      message:comment.message?.toString(),
      type:'comment:remove',
      data:comment.toObject(),
    }, comment.message?.toString())


    await Message.findByIdAndUpdate(comment.message,{
      $inc:{
        commentCount:-1
      }
    },{session})
    await session.commitTransaction();





    return `Comment removed successfully.`;
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to remove comment, please try again later.");
  }
}

const getCommentByMessage = async(messageId:Types.ObjectId, pagination:IPaginationOptions)=>{
  const {page,limit,skip,sortBy,sortOrder} = paginationHelper.calculatePagination(pagination);
  const [total,comments] = await Promise.all([
    Comment.countDocuments({
      message:messageId
    }),
    Comment.find({
      message:messageId
    }).populate({
      path:'user',
      select:'firstName lastName profile'
    }).populate({
      path:'reactions',
      select:'firstName lastName profile'

  
    })
    .sort({
      [sortBy]:sortOrder
    }).skip(skip).limit(limit).lean()
  ]);
  return {
    meta:{
      page,
      limit,
      total:total,
      totalPage:Math.ceil(total/limit)
    },
    data:comments
  }
}


const reactForComment = async(commentId:Types.ObjectId, user:JwtPayload)=>{
  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new ApiError(StatusCodes.NOT_FOUND,"The requested comment not found.");
  }
  if(comment.reactions.includes(user.authId)){
    //remove the user id from the array and save
    comment.reactions = comment.reactions.filter(id=>id.toString() !== user.authId.toString());
    await comment.save();

    emitEvent('messageFeedUpdate',{
      comment:comment?._id?.toString(),
      type:'comment:reaction:remove',
      data:comment.toObject(),
    }, comment.message?.toString())

  }else{
    //add the user id to the array and save
    comment.reactions.push(user.authId);
    await comment.save();

     emitEvent('messageFeedUpdate',{
      comment:comment?._id?.toString(),
      type:'comment:reaction:create',
      data:comment.toObject(),
    }, comment.message?.toString())

    //send notification
      const notificationData = {
      from: {
        authId: user.authId.toString(),
        name: user.name,
        profile: user.profile?.toString(),
      },
      to: comment.user.toString(),
      title: `${user.name} reacted on your comment.`,
      body: `${user.name} reacted on your comment.`,
    };
    
    await sendNotification(notificationData.from, notificationData.to, notificationData.title, notificationData.body);
  }
  return `Comment reacted successfully.`;
}



export const CommentServices = {
  createComment,
  removeComment,
  getCommentByMessage,
  reactForComment,
};