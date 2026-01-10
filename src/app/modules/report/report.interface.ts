import { Model, Types } from 'mongoose';

export interface IReportFilterables {
  searchTerm?: string;
  reportedReason?: string;
  status?: 'pending' | 'in review' | 'resolved' | 'rejected';
}

export interface IReport {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  reportedUser?: Types.ObjectId;
  reportedMessage?: Types.ObjectId;
  reportedComment?: Types.ObjectId;
  reportedReason: string;
  status: 'pending' | 'in review' | 'resolved' | 'rejected';
  feedBack?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportModel = Model<IReport, {}, {}>;
