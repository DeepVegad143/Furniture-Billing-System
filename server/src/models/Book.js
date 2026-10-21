import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    catalogItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CatalogItem',
      default: null,
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
      required: true,
      default: 'SQ.FT',
    },
    length: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    area: {
      type: Number,
      default: 0,
    },
    sheets: {
      type: Number,
      default: 0,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
    },
    rate: {
      type: Number,
      required: true,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    items: [itemSchema],
    pageTotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const bookSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    billNumber: {
      type: String,
      required: true,
    },
    pages: {
      type: [pageSchema],
      default: () => [{ title: 'Page 1', items: [], pageTotal: 0 }],
    },
    payments: {
      type: [paymentSchema],
      default: [],
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    paidTotal: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ ownerId: 1, customerId: 1, date: -1 });
bookSchema.index({ ownerId: 1, billNumber: 1 });

export const Book = mongoose.model('Book', bookSchema);
