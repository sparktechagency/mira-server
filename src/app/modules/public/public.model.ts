import { Schema, model } from 'mongoose'
import { FaqModel, IFaq, IPublic, PublicModel } from './public.interface'

const publicSchema = new Schema<IPublic, PublicModel>(
  {
    content: { type: String },
    type: { type: String, enum: ['privacy-policy', 'terms-and-condition','contact','about'] },
  },
  {
    timestamps: true,
  },
)

export const Public = model<IPublic, PublicModel>('Public', publicSchema)

const faqSchema = new Schema<IFaq, FaqModel>(
  {
    question: { type: String },
    answer: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

export const Faq = model<IFaq, FaqModel>('Faq', faqSchema)
