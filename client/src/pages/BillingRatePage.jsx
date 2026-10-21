import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import {
  FileSpreadsheet,
  FileDown,
  Share2,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Search
} from 'lucide-react';
import { apiService } from '../api/client';
import RateQuoteDocument from '../pdf/RateQuoteDocument';
import { sharePdfToWhatsApp } from '../utils/whatsapp';

export default function BillingRatePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [settings, setSettings] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [defaultCatalog, setDefaultCatalog] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customer selection / manual input
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    searchParams.get('customerId') || ''
  );
  const [manualCustomer, setManualCustomer] = useState({
    name: '',
    phone: '',
  });

  const [quoteDate, setQuoteDate] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState('');

  // Load initial catalog, settings, customers, or past quote
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, catalogRes, customersRes] = await Promise.all([
          apiService.getSettings(),
          apiService.getCatalog(),
          apiService.getCustomers(),
        ]);
        setSettings(settingsRes.data.settings);
        setCustomers(customersRes.data.customers);

        const sortedCatalog = [...(catalogRes.data.items || [])].sort((a, b) =>
          a.nameEn.localeCompare(b.nameEn, undefined, { sensitivity: 'base' })
        );
        setDefaultCatalog(sortedCatalog);

        // Check if viewing an existing quote
        const quoteId = searchParams.get('quoteId');
        if (quoteId) {
          const qRes = await apiService.getQuoteById(quoteId);
          const q = qRes.data.quote;
          setQuoteItems(q.items);
          setQuoteDate(q.date || '');
          if (q.customerId) {
            setSelectedCustomerId(q.customerId.toString());
          }
          if (q.customerSnapshot) {
            setManualCustomer({
              name: q.customerSnapshot.name || '',
              phone: q.customerSnapshot.phone || '',
            });
          }
        } else {
          // Initialize with default prices in alphabetical order
          setQuoteItems(
            sortedCatalog.map(item => ({
              nameEn: item.nameEn,
              nameGu: item.nameGu || '',
              unit: item.unit,
              rate: item.defaultRate,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load quote data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchParams]);

  // When customer is picked from dropdown
  const handleCustomerSelect = custId => {
    setSelectedCustomerId(custId);
    const found = customers.find(c => c._id === custId);
    if (found) {
      setManualCustomer({
        name: found.name || '',
        phone: found.phone || '',
      });
    }
  };

  // Reset temporary rates back to default
  const handleResetDefaults = () => {
    setQuoteItems(
      defaultCatalog.map(item => ({
        nameEn: item.nameEn,
        nameGu: item.nameGu || '',
        unit: item.unit,
        rate: item.defaultRate,
      }))
    );
  };

  const handleRateChange = (index, newRate) => {
    const val = parseFloat(newRate);
    setQuoteItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], rate: isNaN(val) ? 0 : val };
      return next;
    });
  };

  // Save quote snapshot to history and return quote object
  const saveQuoteSnapshot = async () => {
    const customerSnapshot = {
      name: manualCustomer.name.trim(),
      phone: manualCustomer.phone.trim(),
    };

    const res = await apiService.createQuote({
      customerId: selectedCustomerId || null,
      customerSnapshot,
      date: quoteDate,
      items: quoteItems,
    });

    setSavedSuccessNotice(t('quoteGenerated'));
    setTimeout(() => setSavedSuccessNotice(''), 4000);

    return res.data.quote;
  };

  // Generate PDF
  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const savedQuote = await saveQuoteSnapshot();
      const customer = customers.find(c => c._id === selectedCustomerId) || manualCustomer;

      const doc = (
        <RateQuoteDocument
          quote={savedQuote}
          customer={customer}
          settings={settings}
          lang={i18n.language}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const custName = (customer?.name || 'Customer').replace(/\s+/g, '_');
      const datePart = quoteDate ? `_${quoteDate}` : '';
      const filename = `DeepFurniture_Rates_${custName}${datePart}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Failed to generate rate quote PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Share on WhatsApp
  const handleShareWhatsApp = async () => {
    setSharingWhatsApp(true);
    try {
      const savedQuote = await saveQuoteSnapshot();
      const customer = customers.find(c => c._id === selectedCustomerId) || manualCustomer;

      const doc = (
        <RateQuoteDocument
          quote={savedQuote}
          customer={customer}
          settings={settings}
          lang={i18n.language}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const custName = (customer?.name || 'Customer').replace(/\s+/g, '_');
      const datePart = quoteDate ? `_${quoteDate}` : '';
      const filename = `DeepFurniture_Rates_${custName}${datePart}.pdf`;

      await sharePdfToWhatsApp({
        pdfBlob: blob,
        filename,
        customerPhone: customer?.phone,
        customerName: customer?.name,
        message: t('whatsappMessage'),
        onFallback: () => {
          alert(t('manualAttachNotice'));
        },
      });
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to share quote to WhatsApp');
    } finally {
      setSharingWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-8">
        <div className="h-32 bg-white rounded-3xl animate-pulse" />
        <div className="h-96 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-wood" />
            <span>{t('billingRateTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            {t('billingRateSubtitle')}
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-cream-300 text-gray-600 hover:text-navy rounded-2xl font-semibold text-xs shadow-soft transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetToDefaultRates')}</span>
        </button>
      </div>

      {savedSuccessNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessNotice}</span>
        </motion.div>
      )}

      {/* CUSTOMER & DATE CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-cream-300 space-y-4">
        <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
          Client & Quotation Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pick Existing Customer */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('selectCustomer')}
            </label>
            <select
              value={selectedCustomerId}
              onChange={e => handleCustomerSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:outline-none focus:bg-white"
            >
              <option value="">-- Choose Existing Client --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('customerName')}
            </label>
            <input
              type="text"
              value={manualCustomer.name}
              onChange={e => setManualCustomer({ ...manualCustomer, name: e.target.value })}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:outline-none focus:bg-white"
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={manualCustomer.phone}
              onChange={e => setManualCustomer({ ...manualCustomer, phone: e.target.value })}
              placeholder="e.g. 98250 12345"
              className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:outline-none focus:bg-white"
            />
          </div>

          {/* Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-600">
                {t('date')}
              </label>
              {quoteDate && (
                <button
                  type="button"
                  onClick={() => setQuoteDate('')}
                  className="text-[10px] text-wood hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              value={quoteDate}
              onChange={e => setQuoteDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:outline-none focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* RATES TABLE (26 ITEMS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-cream-300 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
            Job Work Rates (Temporary for this Quote)
          </h3>
          <span className="text-xs text-gray-400">
            {quoteItems.length} standard items loaded
          </span>
        </div>

        <div className="divide-y divide-cream-300 max-h-[550px] overflow-y-auto pr-1">
          {quoteItems.map((item, idx) => (
            <div
              key={idx}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-cream/40 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-gray-400 w-6 shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-navy text-xs sm:text-sm truncate">
                    {i18n.language === 'gu' && item.nameGu ? item.nameGu : item.nameEn}
                  </h4>
                  {item.nameGu && i18n.language !== 'gu' && (
                    <span className="text-[11px] text-gray-400 block truncate">
                      {item.nameGu}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs font-mono font-bold bg-navy-100 text-navy-800 px-2 py-0.5 rounded-lg">
                  1 {item.unit}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={item.rate}
                    onChange={e => handleRateChange(idx, e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-cream/50 border border-cream-300 rounded-xl text-navy font-bold text-sm text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 text-center sm:text-left">
          Generating PDF saves this quote into customer's history.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Download PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="flex-1 sm:flex-initial h-12 px-6 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
          >
            {generatingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{t('generatePdf')}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            disabled={sharingWhatsApp}
            className="flex-1 sm:flex-initial h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
          >
            {sharingWhatsApp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span>{t('shareWhatsApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
