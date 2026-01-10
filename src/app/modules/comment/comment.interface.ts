import { Model, Types } from 'mongoose';

export interface ICommentFilterables {
  searchTerm?: string;
  content?: string;
}

export interface IComment {
  _id: Types.ObjectId;
  message: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  reactions: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentModel = Model<IComment, {}, {}>;
