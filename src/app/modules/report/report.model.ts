import { Schema, model } from 'mongoose';
import { IReport, ReportModel } from './report.interface'; 

const reportSchema = new Schema<IReport, ReportModel>({
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reportedMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  reportedComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  reportedReason: { type: String },
  status: { type: String, default: 'pending' },
  feedBack: { type: String },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
});

export const Report = model<IReport, ReportModel>('Report', reportSchema);
