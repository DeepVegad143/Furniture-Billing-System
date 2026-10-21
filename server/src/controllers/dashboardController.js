import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { Book } from '../models/Book.js';

export async function getDashboard(req, res, next) {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Total pending amount across all books
    const pendingAgg = await Book.aggregate([
      { $match: { ownerId: ownerObjectId } },
      { $group: { _id: null, totalPending: { $sum: '$balance' } } },
    ]);
    const totalPending = pendingAgg.length > 0
      ? Math.max(0, Math.round((pendingAgg[0].totalPending + Number.EPSILON) * 100) / 100)
      : 0;

    // 2. Bills this month (count of books created in current calendar month YYYY-MM)
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const billsThisMonth = await Book.countDocuments({
      ownerId: req.user.id,
      date: { $regex: `^${currentYearMonth}` },
    });

    // 3. Total customers
    const totalCustomers = await Customer.countDocuments({ ownerId: req.user.id });

    // 4. Recent books (latest 8 books)
    const recentBooks = await Book.find({ ownerId: req.user.id })
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .populate('customerId', 'name phone address')
      .lean();

    res.json({
      success: true,
      stats: {
        totalPending,
        billsThisMonth,
        totalCustomers,
      },
      recentBooks,
    });
  } catch (err) {
    next(err);
  }
}
