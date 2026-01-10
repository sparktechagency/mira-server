import { Schema, model } from 'mongoose';
import { IReaction, ReactionModel } from './reaction.interface'; 

const reactionSchema = new Schema<IReaction, ReactionModel>({
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Reaction = model<IReaction, ReactionModel>('Reaction', reactionSchema);
