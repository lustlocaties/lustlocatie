import { Model, Schema, Types, model, models } from 'mongoose';

export interface IReview {
  userId: Types.ObjectId;
  locationId: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ReviewSchema.index({ userId: 1, locationId: 1 }, { unique: true });

export const ReviewModel = (models.Review as Model<IReview>) || model<IReview>('Review', ReviewSchema);
