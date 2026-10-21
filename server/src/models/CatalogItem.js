import mongoose from 'mongoose';

const catalogItemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    nameGu: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      enum: ['SQ.FT', 'R.F', 'NOS'],
      required: true,
      default: 'SQ.FT',
    },
    defaultRate: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

catalogItemSchema.index({ ownerId: 1, order: 1 });

export const CatalogItem = mongoose.model('CatalogItem', catalogItemSchema);
