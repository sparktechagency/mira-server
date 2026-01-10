import { Model, Types } from 'mongoose'

export type IPublic = {
  content: string
  type: string
}

export interface IContact {
  name: string
  email: string
  phone: string
  country: string
  message: string
  createdAt?: Date
  updatedAt?: Date
}
export type PublicModel = Model<IPublic>

export type IFaq = {
  question: string
  answer: string
  createdAt: Date
  updatedAt: Date
}

export type FaqModel = Model<IFaq>
