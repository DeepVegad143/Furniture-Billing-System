import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'demo'],
      default: 'owner',
    },
    language: {
      type: String,
      enum: ['en', 'gu'],
      default: 'en',
    },
    demoLastReset: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
