import { Schema, model } from 'mongoose';
import { ISupport, SupportModel } from './support.interface'; 

const supportSchema = new Schema<ISupport, SupportModel>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true
});

export const Support = model<ISupport, SupportModel>('Support', supportSchema);
