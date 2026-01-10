import { Schema, model } from 'mongoose'
import { IToken, TokenModel } from './token.interface'

const tokenSchema = new Schema<IToken, TokenModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Token = model<IToken, TokenModel>('Token', tokenSchema)
