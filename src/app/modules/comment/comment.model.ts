import { Schema, model } from 'mongoose';
import { IComment, CommentModel } from './comment.interface'; 

const commentSchema = new Schema<IComment, CommentModel>({
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String },
  isDeleted: { type: Boolean },
  reactions: { type: [Schema.Types.ObjectId], ref: 'User' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Comment = model<IComment, CommentModel>('Comment', commentSchema);
