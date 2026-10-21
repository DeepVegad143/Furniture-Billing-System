import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Calculator,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Users,
  Wallet
} from 'lucide-react';
import { apiService } from '../api/client';
import { formatCurrency } from '@calc';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await apiService.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* GREETING & LOGO HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="Deep Furniture"
            className="w-12 h-auto drop-shadow-sm"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              {t('appName')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {t('tagline')}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-2xl bg-white border border-cream-300 text-gray-500 hover:text-navy hover:shadow-soft active:scale-95 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-wood' : ''}`} />
        </button>
      </div>

      {/* PLAIN-NUMBER CARDS ONLY (Section 4 & 10.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Pending (Highlighted in Navy) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-navy text-white rounded-3xl p-5 sm:p-6 shadow-card relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-navy-200 mb-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
              {t('totalPending')}
            </span>
            <div className="p-2 rounded-xl bg-navy-800/80 text-rose-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            {loading ? '...' : formatCurrency(dashboard?.stats?.totalPending || 0)}
          </div>
          <div className="mt-2 text-xs text-navy-200">
            Across all active customer books
          </div>
        </motion.div>

        {/* Card 2: Bills This Month */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-cream-300 relative"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
              {t('billsThisMonth')}
            </span>
            <div className="p-2 rounded-xl bg-cream text-wood">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-navy mt-1">
            {loading ? '...' : dashboard?.stats?.billsThisMonth || 0}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Jobs created in current month
          </div>
        </motion.div>

        {/* Card 3: Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-cream-300 relative"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
              {t('totalCustomers')}
            </span>
            <div className="p-2 rounded-xl bg-cream text-wood">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-navy mt-1">
            {loading ? '...' : dashboard?.stats?.totalCustomers || 0}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Registered client accounts
          </div>
        </motion.div>
      </div>

      {/* BIG QUICK-ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => navigate('/customers?action=new')}
          className="flex items-center justify-center gap-3 p-4 bg-navy hover:bg-navy-900 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
          style={{ minHeight: '52px' }}
        >
          <UserPlus className="w-5 h-5 text-wood-300" />
          <span className="text-sm sm:text-base">{t('newCustomer')}</span>
        </button>

        <button
          onClick={() => navigate('/billing-rate')}
          className="flex items-center justify-center gap-3 p-4 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-soft transition-all active:scale-[0.98]"
          style={{ minHeight: '52px' }}
        >
          <Calculator className="w-5 h-5 text-amber-200" />
          <span className="text-sm sm:text-base">{t('billingRate')}</span>
        </button>
      </div>

      {/* RECENT BOOKS SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-cream-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-navy">
            {t('recentBooks')}
          </h2>
          <button
            onClick={() => navigate('/customers')}
            className="text-xs sm:text-sm font-semibold text-wood hover:text-wood-600 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-16 bg-cream/70 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !dashboard?.recentBooks || dashboard.recentBooks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p>{t('noRecentBooks')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentBooks.map(book => (
              <motion.div
                key={book._id}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/books/${book._id}`)}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-cream/40 hover:bg-cream border border-cream-300/80 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-navy text-white px-2 py-0.5 rounded-lg">
                      {book.billNumber}
                    </span>
                    <h3 className="font-bold text-navy text-sm sm:text-base truncate">
                      {book.customerId?.name || 'Walk-in Customer'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{book.date}</span>
                    {book.title && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px] sm:max-w-xs">{book.title}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-navy text-sm sm:text-base">
                      {formatCurrency(book.grandTotal)}
                    </div>
                    <div className="mt-0.5">
                      {getStatusBadge(book.status)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 hidden sm:block" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
