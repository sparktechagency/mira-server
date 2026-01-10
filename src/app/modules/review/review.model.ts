import { Schema, model } from 'mongoose';
import { IReview, ReviewModel } from './review.interface'; 

const reviewSchema = new Schema<IReview, ReviewModel>({
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', populate: {path:'reviewer',select:'name lastName fullName profile'} },
  reviewee: { type: Schema.Types.ObjectId, ref: 'User', populate: {path:'reviewee',select:'name lastName fullName profile'} },
  rating: { type: Number },
  review: { type: String },
}, {
  timestamps: true
});

export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
