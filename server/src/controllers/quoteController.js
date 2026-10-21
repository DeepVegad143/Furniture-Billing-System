import { z } from 'zod';
import { RateQuote } from '../models/RateQuote.js';
import { Counter } from '../models/Counter.js';

const quoteSchema = z.object({
  customerId: z.string().nullable().optional(),
  customerSnapshot: z.object({
    name: z.string().default(''),
    phone: z.string().default(''),
    address: z.string().default(''),
  }),
  date: z.string().optional().default(''),
  items: z.array(
    z.object({
      nameEn: z.string().min(1),
      nameGu: z.string().default(''),
      unit: z.string(),
      rate: z.number().min(0),
    })
  ).min(1, 'Quote must have at least one item'),
});

export async function createQuote(req, res, next) {
  try {
    const data = quoteSchema.parse(req.body);

    // Auto-generate quote number per owner
    const counter = await Counter.findOneAndUpdate(
      { ownerId: req.user.id, name: 'quoteNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const quoteNumber = `RQ-${String(counter.seq).padStart(4, '0')}`;

    const quote = await RateQuote.create({
      ...data,
      quoteNumber,
      ownerId: req.user.id,
    });

    res.status(201).json({ success: true, quote });
  } catch (err) {
    next(err);
  }
}

export async function getQuoteById(req, res, next) {
  try {
    const { id } = req.params;

    const quote = await RateQuote.findOne({ _id: id, ownerId: req.user.id }).lean();
    if (!quote) {
      return res.status(404).json({ success: false, error: 'Rate quote not found' });
    }

    res.json({ success: true, quote });
  } catch (err) {
    next(err);
  }
}
