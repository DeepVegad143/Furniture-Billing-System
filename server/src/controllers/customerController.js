import { z } from 'zod';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Book } from '../models/Book.js';
import { RateQuote } from '../models/RateQuote.js';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').trim(),
  phone: z.string().min(1, 'Phone number is required').trim(),
  address: z.string().trim().default(''),
  notes: z.string().trim().default(''),
});

export async function getCustomers(req, res, next) {
  try {
    const { q } = req.query;
    const filter = { ownerId: req.user.id };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { phone: regex }];
    }

    const customers = await Customer.find(filter).sort({ updatedAt: -1 }).lean();

    // Compute pending balance per customer efficiently with aggregation
    const balances = await Book.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$customerId',
          totalPending: { $sum: '$balance' },
          booksCount: { $sum: 1 },
        },
      },
    ]);

    const balanceMap = {};
    balances.forEach(b => {
      balanceMap[b._id.toString()] = {
        pending: Math.max(0, Math.round((b.totalPending + Number.EPSILON) * 100) / 100),
        booksCount: b.booksCount,
      };
    });

    const enrichedCustomers = customers.map(c => {
      const stats = balanceMap[c._id.toString()] || { pending: 0, booksCount: 0 };
      return {
        ...c,
        pendingBalance: stats.pending,
        booksCount: stats.booksCount,
      };
    });

    res.json({ success: true, customers: enrichedCustomers });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await Customer.findOne({ _id: id, ownerId: req.user.id }).lean();

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const books = await Book.find({ customerId: id, ownerId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const pendingBalance = books.reduce((sum, b) => sum + (b.balance || 0), 0);

    res.json({
      success: true,
      customer: {
        ...customer,
        pendingBalance: Math.max(0, Math.round((pendingBalance + Number.EPSILON) * 100) / 100),
        booksCount: books.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const data = customerSchema.parse(req.body);

    const customer = await Customer.create({
      ...data,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      customer: {
        ...customer.toObject(),
        pendingBalance: 0,
        booksCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const data = customerSchema.partial().parse(req.body);

    const customer = await Customer.findOneAndUpdate(
      { _id: id, ownerId: req.user.id },
      { $set: data },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, customer });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await Customer.findOneAndDelete({ _id: id, ownerId: req.user.id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Delete associated books and quotes
    await Book.deleteMany({ customerId: id, ownerId: req.user.id });
    await RateQuote.deleteMany({ customerId: id, ownerId: req.user.id });

    res.json({ success: true, message: 'Customer and related records deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerBooks(req, res, next) {
  try {
    const { id } = req.params;

    const books = await Book.find({ customerId: id, ownerId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, books });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerQuotes(req, res, next) {
  try {
    const { id } = req.params;

    const quotes = await RateQuote.find({ customerId: id, ownerId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, quotes });
  } catch (err) {
    next(err);
  }
}
