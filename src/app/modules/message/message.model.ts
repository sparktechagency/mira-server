import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface'; 

const messageSchema = new Schema<IMessage, MessageModel>({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  deletedBy: { type: [Schema.Types.ObjectId], ref: 'User' },
  reactionCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  isShared: { type: Boolean,default:false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

messageSchema.index({ sender: 1, createdAt: -1 }); // Sender's messages
messageSchema.index({ receiver: 1, createdAt: -1 }); // Receiver's messages
messageSchema.index({ createdAt: -1 }); // Recent messages

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
