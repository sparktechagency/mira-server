import { Model, Types } from 'mongoose';

export interface ISupportFilterables {
  searchTerm?: string;
  subject?: string;
  message?: string;
}

export interface ISupport {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SupportModel = Model<ISupport, {}, {}>;
