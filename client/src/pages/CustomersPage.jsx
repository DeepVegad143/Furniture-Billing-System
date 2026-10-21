import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  ChevronRight,
  X,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../api/client';
import { formatCurrency } from '@calc';

export default function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // New customer form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const isPickingForBook = searchParams.get('action') === 'pick_for_book';

  const fetchCustomers = async (q = '') => {
    try {
      const res = await apiService.getCustomers(q);
      setCustomers(res.data.customers);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (searchParams.get('action') === 'new') {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  };

  const handleCreateCustomer = async e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Please enter both name and phone number');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const res = await apiService.createCustomer(formData);
      const newCustomer = res.data.customer;
      handleCloseModal();

      if (isPickingForBook) {
        // Create new book for this customer right away
        const bookRes = await apiService.createBook({
          customerId: newCustomer._id,
          title: '',
        });
        navigate(`/books/${bookRes.data.book._id}`);
      } else {
        // Refresh customer list
        fetchCustomers(searchQuery);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerClick = async customer => {
    if (isPickingForBook) {
      // Create new book for this customer
      try {
        const bookRes = await apiService.createBook({
          customerId: customer._id,
          title: '',
        });
        navigate(`/books/${bookRes.data.book._id}`);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to create book');
      }
    } else {
      navigate(`/customers/${customer._id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
            {isPickingForBook ? 'Select Customer for New Book' : t('navCustomers')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            {isPickingForBook
              ? 'Choose an existing customer or add a new one'
              : 'Manage clients, balance tracking, and jobs'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('searchCustomers')}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-cream-300 rounded-2xl text-navy shadow-soft focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CUSTOMER LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-white rounded-3xl p-5 shadow-soft animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-soft border border-cream-300">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy mb-1">{t('noCustomersFound')}</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-5">
            No customer matches your search. Click below to add a new customer.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white font-semibold rounded-2xl text-sm"
          >
            <UserPlus className="w-4 h-4 text-wood-300" />
            <span>{t('addCustomer')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map(c => (
            <motion.div
              key={c._id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleCustomerClick(c)}
              className="bg-white rounded-3xl p-5 shadow-soft border border-cream-300 hover:border-wood/40 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-extrabold text-navy text-base sm:text-lg truncate">
                    {c.name}
                  </h3>
                  {c.pendingBalance > 0 ? (
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {formatCurrency(c.pendingBalance)} pending
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      All clear ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-2 font-medium">
                  <Phone className="w-4 h-4 text-wood shrink-0" />
                  <span>{c.phone}</span>
                </div>

                {c.address && (
                  <div className="flex items-start gap-2 text-xs text-gray-400 mt-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-cream-300 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {c.booksCount || 0} {t('booksCount')}
                </span>
                <span className="font-semibold text-wood flex items-center gap-1">
                  <span>{isPickingForBook ? 'Select' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-floating relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-navy mb-1">{t('addCustomer')}</h2>
              <p className="text-xs text-gray-500 mb-6">Enter customer contact details</p>

              {formError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('customerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98250 12345"
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('address')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. B-204, Shivalik Residency, Adajan, Surat"
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy transition-all resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    {t('notes')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Prefers teak wood finish. Master bedroom renovation."
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy transition-all resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-3 rounded-2xl border border-cream-300 text-gray-600 font-semibold text-sm hover:bg-cream transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-2xl bg-wood hover:bg-wood-600 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
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
    </div>
  );
}
