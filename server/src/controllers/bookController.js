import { z } from 'zod';
import { Book } from '../models/Book.js';
import { Customer } from '../models/Customer.js';
import { getNextBillNumber } from '../models/Counter.js';
import { calculateBookTotals } from '../../../calc/index.js';

const createBookSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  title: z.string().trim().default(''),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
});

const updateBookSchema = z.object({
  title: z.string().trim().optional(),
  date: z.string().optional(),
  pages: z.array(
    z.object({
      _id: z.any().optional(),
      title: z.string().default(''),
      items: z.array(
        z.object({
          _id: z.any().optional(),
          catalogItemId: z.string().nullable().optional(),
          nameEn: z.string().min(1, 'Item name is required'),
          nameGu: z.string().default(''),
          unit: z.string().default('SQ.FT'),
          length: z.number().default(0),
          width: z.number().default(0),
          area: z.number().default(0),
          sheets: z.number().optional().default(0),
          qty: z.number().default(1),
          rate: z.number().default(0),
          isCustom: z.boolean().default(false),
          note: z.string().default(''),
        })
      ).default([]),
    })
  ).min(1, 'Book must have at least 1 page'),
  payments: z.array(
    z.object({
      _id: z.any().optional(),
      amount: z.number().min(0),
      date: z.string(),
      note: z.string().default(''),
    })
  ).optional(),
});

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  note: z.string().trim().default(''),
});

export async function createBook(req, res, next) {
  try {
    const data = createBookSchema.parse(req.body);

    // Verify customer belongs to owner
    const customer = await Customer.findOne({ _id: data.customerId, ownerId: req.user.id });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const billNumber = await getNextBillNumber(req.user.id);

    const initialPages = [{ title: 'Page 1', items: [], pageTotal: 0 }];
    const calculated = calculateBookTotals(initialPages, []);

    const book = await Book.create({
      ownerId: req.user.id,
      customerId: data.customerId,
      title: data.title,
      date: data.date,
      billNumber,
      pages: calculated.computedPages,
      payments: [],
      grandTotal: calculated.grandTotal,
      paidTotal: calculated.paidTotal,
      balance: calculated.balance,
      status: calculated.status,
    });

    const populatedBook = await Book.findById(book._id)
      .populate('customerId', 'name phone address')
      .lean();

    res.status(201).json({ success: true, book: populatedBook });
  } catch (err) {
    next(err);
  }
}

export async function getBookById(req, res, next) {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, ownerId: req.user.id })
      .populate('customerId', 'name phone address')
      .lean();

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, book });
  } catch (err) {
    next(err);
  }
}

export async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const data = updateBookSchema.parse(req.body);

    const existingBook = await Book.findOne({ _id: id, ownerId: req.user.id });
    if (!existingBook) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const payments = data.payments !== undefined ? data.payments : existingBook.payments;

    // Server recomputes all items, page totals, grand totals and balance
    const calculated = calculateBookTotals(data.pages, payments);

    existingBook.title = data.title !== undefined ? data.title : existingBook.title;
    existingBook.date = data.date || existingBook.date;
    existingBook.pages = calculated.computedPages;
    existingBook.payments = payments;
    existingBook.grandTotal = calculated.grandTotal;
    existingBook.paidTotal = calculated.paidTotal;
    existingBook.balance = calculated.balance;
    existingBook.status = calculated.status;

    await existingBook.save();

    const populated = await Book.findById(existingBook._id)
      .populate('customerId', 'name phone address')
      .lean();

    res.json({ success: true, book: populated });
  } catch (err) {
    next(err);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;

    const book = await Book.findOneAndDelete({ _id: id, ownerId: req.user.id });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function addPayment(req, res, next) {
  try {
    const { id } = req.params;
    const paymentData = paymentSchema.parse(req.body);

    const book = await Book.findOne({ _id: id, ownerId: req.user.id });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    book.payments.push(paymentData);

    const calculated = calculateBookTotals(book.pages, book.payments);
    book.pages = calculated.computedPages;
    book.grandTotal = calculated.grandTotal;
    book.paidTotal = calculated.paidTotal;
    book.balance = calculated.balance;
    book.status = calculated.status;

    await book.save();

    const populated = await Book.findById(book._id)
      .populate('customerId', 'name phone address')
      .lean();

    res.json({ success: true, book: populated });
  } catch (err) {
    next(err);
  }
}

export async function deletePayment(req, res, next) {
  try {
    const { id, paymentId } = req.params;

    const book = await Book.findOne({ _id: id, ownerId: req.user.id });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    book.payments = book.payments.filter(p => p._id.toString() !== paymentId);

    const calculated = calculateBookTotals(book.pages, book.payments);
    book.pages = calculated.computedPages;
    book.grandTotal = calculated.grandTotal;
    book.paidTotal = calculated.paidTotal;
    book.balance = calculated.balance;
    book.status = calculated.status;

    await book.save();

    const populated = await Book.findById(book._id)
      .populate('customerId', 'name phone address')
      .lean();

    res.json({ success: true, book: populated });
  } catch (err) {
    next(err);
  }
}
