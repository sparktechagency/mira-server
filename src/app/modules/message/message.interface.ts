import { Model, Types } from 'mongoose'

export interface IMessage {
  _id: Types.ObjectId
  message: string
  sender: Types.ObjectId
  receiver: Types.ObjectId
  deletedBy: Types.ObjectId[]
  reactionCount: number
  commentCount: number
  isShared: boolean
  createdAt: Date
  updatedAt: Date
}

export type MessageModel = Model<IMessage, {}, {}>

export type IMessageFilterables = {
  isInbox?: boolean
}
