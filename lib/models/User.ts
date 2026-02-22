import { Model, Schema, model, models } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  // Profile fields
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth?: Date;
  bio_updated_at?: Date;
  // Friends
  friends: Schema.Types.ObjectId[];
  blockedUsers: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    // Profile fields
    bio: {
      type: String,
      default: '',
      maxlength: 500,
      trim: true,
    },
    location: {
      type: String,
      default: '',
      maxlength: 100,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    bio_updated_at: {
      type: Date,
      default: null,
    },
    friends: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    blockedUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = (models.User as Model<IUser>) || model<IUser>('User', UserSchema);
