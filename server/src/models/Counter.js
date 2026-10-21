import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: 'billNumber',
  },
  seq: {
    type: Number,
    default: 0,
  },
});

counterSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically get the next sequential bill number for an owner.
 * Format: DF-0001
 */
export async function getNextBillNumber(ownerId) {
  const counter = await Counter.findOneAndUpdate(
    { ownerId, name: 'billNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const formattedSeq = String(counter.seq).padStart(4, '0');
  return `DF-${formattedSeq}`;
}
