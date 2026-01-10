import { Types } from 'mongoose';
import { z } from 'zod';

export const CommentValidations = {
  create: z.object({
    body:z.object({
      content:z.string({
        required_error:'Content is required',
      }).min(1,{
        message:'Content must be at least 10 characters',
      }),
    }),
    params:z.object({
      messageId:z.string({
        required_error:'Message id is required',
      }).refine((value)=>Types.ObjectId.isValid(value),{
        message:'Invalid message id',
      }),
    }),
  }),
  remove:z.object({
    params:z.object({
      commentId:z.string({
        required_error:'Comment id is required',
      }).refine((value)=>Types.ObjectId.isValid(value),{
        message:'Invalid comment id',
      }),
    }),
  }),
  get:z.object({
    params:z.object({
      messageId:z.string({
        required_error:'Message id is required',
      }).refine((value)=>Types.ObjectId.isValid(value),{
        message:'Invalid message id',
      }),
    }),
  }),
  react:z.object({
    params:z.object({
      commentId:z.string({
        required_error:'Comment id is required',
      }).refine((value)=>Types.ObjectId.isValid(value),{
        message:'Invalid comment id',
      }),
    }),
  }),
};
