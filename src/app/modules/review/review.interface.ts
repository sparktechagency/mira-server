import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';

export type IReview = {
  _id?: Types.ObjectId;
  reviewer: Types.ObjectId | IUser;
  reviewee: Types.ObjectId | IUser;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReviewModel = Model<IReview>;
