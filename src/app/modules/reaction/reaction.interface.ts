import { Model, Types } from 'mongoose';

export interface IReaction {
  _id: Types.ObjectId;
  message: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ReactionModel = Model<IReaction, {}, {}>;
