import { Model, Schema, model, models } from 'mongoose';

export interface ILocation {
  title: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  address?: string;
  amenities: string[];
  imageUrls: string[];
  pricePerNight?: number;
  isPublished: boolean;
}

const LocationSchema = new Schema<ILocation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    pricePerNight: {
      type: Number,
      min: 0,
    },
    isPublished: {
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

export const LocationModel =
  (models.Location as Model<ILocation>) || model<ILocation>('Location', LocationSchema);
