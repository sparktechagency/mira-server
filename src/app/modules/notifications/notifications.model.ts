import { Schema, model } from 'mongoose'
import { INotification, NotificationModel } from './notifications.interface'

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    to: { type: Schema.Types.ObjectId, ref: 'User' , populate: 'firstName lastName profile' },
    from: { type: Schema.Types.ObjectId, ref: 'User', populate: 'firstName lastName profile' },
    title: { type: String },
    body: { type: String },
    isRead: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
)
