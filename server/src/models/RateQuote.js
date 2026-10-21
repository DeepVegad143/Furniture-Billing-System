import mongoose from 'mongoose';

const rateQuoteItemSchema = new mongoose.Schema(
  {
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
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const rateQuoteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    customerSnapshot: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    date: {
      type: String,
      default: '',
    },
    quoteNumber: {
      type: String,
      default: '',
    },
    items: [rateQuoteItemSchema],
  },
  {
    timestamps: true,
  }
);

rateQuoteSchema.index({ ownerId: 1, customerId: 1, createdAt: -1 });

export const RateQuote = mongoose.model('RateQuote', rateQuoteSchema);
