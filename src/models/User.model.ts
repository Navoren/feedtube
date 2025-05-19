// lib/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  topics: mongoose.Types.ObjectId[]; // Reference to topics created by the user
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  verifyCode: {
    type: String,
    required: [true, 'Please provide a verification code'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Please provide a verification code expiry date'],
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
    required: true,
  },
  topics: [{
    type: Schema.Types.ObjectId,
    ref: 'Topic',
  }],
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;