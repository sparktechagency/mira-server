import mongoose from 'mongoose';
import { z } from 'zod';

export const ReactionValidations = {
  toggleReaction: z.object({
    params: z.object({
     messageId: z.string({
    required_error: 'Message id is required'
  }).refine(
    (data) => mongoose.Types.ObjectId.isValid(data),
    { message: 'Message id is invalid' }
  ) 
    }),
  }),
  getReactionListByMessage: z.object({
    params: z.object({
      messageId: z.string({
        required_error: 'Message id is required'
      }).refine(
        (data) => mongoose.Types.ObjectId.isValid(data),
        { message: 'Message id is invalid' }
      ) 
    }),
  }),
};
