import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  FileText,
  FileSpreadsheet,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Share2,
  Download
} from 'lucide-react';
import { apiService } from '../api/client';
import { formatCurrency } from '@calc';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [customer, setCustomer] = useState(null);
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingBook, setCreatingBook] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [custRes, booksRes, quotesRes] = await Promise.all([
        apiService.getCustomerById(id),
        apiService.getCustomerBooks(id),
        apiService.getCustomerQuotes(id),
      ]);
      setCustomer(custRes.data.customer);
      setBooks(booksRes.data.books);
      setQuotes(quotesRes.data.quotes);
      setEditFormData({
        name: custRes.data.customer.name,
        phone: custRes.data.customer.phone,
        address: custRes.data.customer.address || '',
        notes: custRes.data.customer.notes || '',
      });
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateCustomer = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiService.updateCustomer(id, editFormData);
      setCustomer(prev => ({ ...prev, ...res.data.customer }));
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    setDeleting(true);
    try {
      await apiService.deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete customer');
      setDeleting(false);
    }
  };

  const handleCreateNewBook = async () => {
    setCreatingBook(true);
    try {
      const res = await apiService.createBook({
        customerId: id,
        title: '',
      });
      navigate(`/books/${res.data.book._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create new book');
      setCreatingBook(false);
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('paid')}
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t('partial')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            {t('pending')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
        <div className="h-60 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 bg-navy text-white rounded-xl text-sm"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* BACK BUTTON & TOP BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-wood transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('navCustomers')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white border border-cream-300 text-gray-600 hover:text-navy hover:shadow-soft active:scale-95 transition-all"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CUSTOMER INFO & PENDING TOTAL CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              {customer.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Phone className="w-4 h-4 text-wood shrink-0" />
              <a href={`tel:${customer.phone}`} className="hover:underline">
                {customer.phone}
              </a>
            </div>
            {customer.address && (
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <p className="text-xs text-gray-400 bg-cream/70 p-3 rounded-2xl mt-2">
                {customer.notes}
              </p>
            )}
          </div>

          {/* Pending Total across all books */}
          <div className="p-5 rounded-2xl bg-navy text-white text-center sm:text-right shrink-0 min-w-[200px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-navy-200">
              {t('balance')}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrency(customer.pendingBalance || 0)}
            </div>
            <div className="text-xs text-navy-300 mt-1">
              {books.length} {t('booksCount')}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: JOB BOOKS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
            <FileText className="w-5 h-5 text-wood" />
            <span>{t('allBooks')}</span>
          </h2>

          <button
            onClick={handleCreateNewBook}
            disabled={creatingBook}
            className="flex items-center gap-2 px-4 py-2.5 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-sm text-sm active:scale-95 transition-all"
          >
            {creatingBook ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{t('newBook')}</span>
          </button>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-cream-300 shadow-soft">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-4">{t('noBooksYet')}</p>
            <button
              onClick={handleCreateNewBook}
              className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-2xl"
            >
              {t('newBook')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map(book => (
              <motion.div
                key={book._id}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/books/${book._id}`)}
                className="bg-white rounded-3xl p-5 shadow-soft border border-cream-300 hover:border-wood/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-navy text-white px-2 py-0.5 rounded-lg">
                      {book.billNumber}
                    </span>
                    <h3 className="font-bold text-navy text-base">
                      {book.title || 'Untitled Job Book'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{book.date}</span>
                    <span>•</span>
                    <span>{book.pages?.length || 1} Pages</span>
                    {book.balance > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">
                          Balance: {formatCurrency(book.balance)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-navy text-base">
                      {formatCurrency(book.grandTotal)}
                    </div>
                    <div className="mt-0.5">{getStatusBadge(book.status)}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 hidden sm:block" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: RATE QUOTES HISTORY */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-wood" />
            <span>{t('rateQuotesHistory')}</span>
          </h2>
          <button
            onClick={() => navigate(`/billing-rate?customerId=${id}`)}
            className="text-xs sm:text-sm font-semibold text-wood hover:text-wood-600 flex items-center gap-1"
          >
            <span>Create Quote</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-cream-300 shadow-soft text-gray-400 text-xs sm:text-sm">
            {t('noQuotesYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quotes.map(quote => (
              <div
                key={quote._id}
                className="bg-white rounded-2xl p-4 shadow-soft border border-cream-300 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-wood bg-wood-50 px-2 py-0.5 rounded-md">
                    {quote.quoteNumber || 'Quote'}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">Date: {quote.date}</div>
                  <div className="text-xs text-gray-400">
                    {quote.items?.length || 0} quoted items
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/billing-rate?quoteId=${quote._id}`)}
                  className="px-3 py-1.5 bg-cream hover:bg-wood hover:text-white rounded-xl text-xs font-semibold text-navy transition-colors"
                >
                  View Quote
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT CUSTOMER MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-floating relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-navy mb-4">{t('editCustomer')}</h2>

              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('customerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('address')}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.address}
                    onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('notes')}
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl border border-cream-300 text-gray-600 font-semibold text-sm hover:bg-cream"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-2xl bg-wood hover:bg-wood-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{saving ? t('saving') : t('save')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-floating"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">{t('deleteCustomer')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                {t('deleteCustomerConfirm')}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-cream-300 text-gray-600 font-semibold text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCustomer}
                  disabled={deleting}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('delete')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
