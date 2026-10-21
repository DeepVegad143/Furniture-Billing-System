import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      default: 'Deep Furniture',
      trim: true,
    },
    phone: {
      type: String,
      default: '98765 43210',
      trim: true,
    },
    address: {
      type: String,
      default: 'Near Patel Estate, GIDC, Surat, Gujarat',
      trim: true,
    },
    gstin: {
      type: String,
      default: '',
      trim: true,
    },
    upiId: {
      type: String,
      default: '',
      trim: true,
    },
    conditions: {
      en: {
        type: [String],
        default: [],
      },
      gu: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model('Settings', settingsSchema);
