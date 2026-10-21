import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileDown,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoveRight,
  Sparkles,
  CreditCard,
  X,
  Search,
  Loader2,
  Edit3
} from 'lucide-react';
import { apiService } from '../api/client';
import {
  calculateItemAmount,
  calculateBookTotals,
  formatCurrency,
  formatIndianNumber
} from '@calc';
import BillDocument from '../pdf/BillDocument';
import { sharePdfToWhatsApp } from '../utils/whatsapp';

export default function BookEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Core Book State
  const [book, setBook] = useState(null);
  const [settings, setSettings] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Autosave State
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const isDirtyRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // UI state for collapsed pages: pageId -> boolean (false = expanded)
  const [collapsedPages, setCollapsedPages] = useState({});

  // Modals
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [targetPageId, setTargetPageId] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [customItemMode, setCustomItemMode] = useState(false);
  const [customForm, setCustomForm] = useState({
    nameEn: '',
    nameGu: '',
    unit: 'SQ.FT',
    rate: 200,
  });

  const [moveModalItem, setMoveModalItem] = useState(null); // { item, fromPageId }
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: 'Cash',
  });
  const [deleteBookModalOpen, setDeleteBookModalOpen] = useState(false);

  // PDF generation state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const [bookRes, settingsRes, catalogRes] = await Promise.all([
          apiService.getBookById(id),
          apiService.getSettings(),
          apiService.getCatalog(),
        ]);
        if (isMounted) {
          setBook(bookRes.data.book);
          setSettings(settingsRes.data.settings);
          setCatalog(catalogRes.data.items);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load book data:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadInitial();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id]);

  // 2. Warn before leaving if changes are pending
  useEffect(() => {
    const handleBeforeUnload = e => {
      if (isDirtyRef.current || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // 3. Debounced Autosave Trigger
  const triggerAutosave = updatedBook => {
    isDirtyRef.current = true;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          title: updatedBook.title,
          date: updatedBook.date,
          pages: updatedBook.pages,
          payments: updatedBook.payments,
        };
        const res = await apiService.updateBook(id, payload);
        setBook(res.data.book);
        isDirtyRef.current = false;
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    }, 800);
  };

  // Immediate Save Flush (used before PDF generation or export)
  const flushSave = async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (isDirtyRef.current && book) {
      setSaveStatus('saving');
      const payload = {
        title: book.title,
        date: book.date,
        pages: book.pages,
        payments: book.payments,
      };
      const res = await apiService.updateBook(id, payload);
      setBook(res.data.book);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      return res.data.book;
    }
    return book;
  };

  // Helper to recompute and update local book state
  const updateBookState = updater => {
    setBook(prev => {
      const draft = updater(prev);
      const calculated = calculateBookTotals(draft.pages, draft.payments);
      const nextBook = {
        ...draft,
        pages: calculated.computedPages,
        grandTotal: calculated.grandTotal,
        paidTotal: calculated.paidTotal,
        balance: calculated.balance,
        status: calculated.status,
      };
      triggerAutosave(nextBook);
      return nextBook;
    });
  };

  // Page Operations
  const handleAddPage = () => {
    updateBookState(prev => {
      const newPageNum = prev.pages.length + 1;
      return {
        ...prev,
        pages: [
          ...prev.pages,
          {
            title: `Page ${newPageNum}`,
            items: [],
            pageTotal: 0,
          },
        ],
      };
    });
  };

  const handleDeletePage = pageIndex => {
    if (book.pages.length <= 1) {
      alert('A book must have at least 1 page');
      return;
    }
    if (!window.confirm(t('deletePageConfirm'))) return;

    updateBookState(prev => ({
      ...prev,
      pages: prev.pages.filter((_, idx) => idx !== pageIndex),
    }));
  };

  const handlePageTitleChange = (pageIndex, newTitle) => {
    updateBookState(prev => {
      const nextPages = [...prev.pages];
      nextPages[pageIndex] = { ...nextPages[pageIndex], title: newTitle };
      return { ...prev, pages: nextPages };
    });
  };

  const togglePageCollapse = pageId => {
    setCollapsedPages(prev => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  // Item Operations
  const handleOpenItemPicker = pageId => {
    setTargetPageId(pageId);
    setCatalogSearch('');
    setCustomItemMode(false);
    setItemPickerOpen(true);
  };

  const handleSelectCatalogItem = item => {
    const isInsideLaminate = item.nameEn && /inside\s*[-–]?\s*laminate/i.test(item.nameEn);
    const initialSheets = isInsideLaminate ? 1 : 0;

    const newItem = {
      catalogItemId: item._id,
      nameEn: item.nameEn,
      nameGu: item.nameGu || '',
      unit: item.unit,
      length: 0,
      width: 0,
      sheets: initialSheets,
      qty: 1,
      rate: item.defaultRate,
      amount: calculateItemAmount({
        nameEn: item.nameEn,
        unit: item.unit,
        sheets: initialSheets,
        qty: 1,
        rate: item.defaultRate,
      }).amount,
      isCustom: false,
      note: '',
    };

    addItemToPage(targetPageId, newItem);
    setItemPickerOpen(false);
  };

  const handleAddCustomItem = e => {
    e.preventDefault();
    if (!customForm.nameEn.trim()) return;

    const isInsideLaminate = /inside\s*[-–]?\s*laminate/i.test(customForm.nameEn);
    const initialSheets = isInsideLaminate ? 1 : 0;

    const newItem = {
      catalogItemId: null,
      nameEn: customForm.nameEn.trim(),
      nameGu: customForm.nameGu.trim(),
      unit: customForm.unit,
      length: 0,
      width: 0,
      sheets: initialSheets,
      qty: 1,
      rate: Number(customForm.rate) || 0,
      amount: calculateItemAmount({
        nameEn: customForm.nameEn,
        unit: customForm.unit,
        sheets: initialSheets,
        qty: 1,
        rate: Number(customForm.rate) || 0,
      }).amount,
      isCustom: true,
      note: '',
    };

    addItemToPage(targetPageId, newItem);
    setItemPickerOpen(false);
  };

  const addItemToPage = (pageId, item) => {
    updateBookState(prev => {
      const nextPages = prev.pages.map(p => {
        if (p._id === pageId || (!p._id && prev.pages[0] === p)) {
          return {
            ...p,
            items: [...p.items, item],
          };
        }
        return p;
      });
      return { ...prev, pages: nextPages };
    });
  };

  const handleItemFieldChange = (pageIdx, itemIdx, field, value) => {
    updateBookState(prev => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[pageIdx] };
      const nextItems = [...page.items];
      const item = { ...nextItems[itemIdx], [field]: value };

      if (field === 'sheets') {
        item.qty = value;
      }

      // Live amount calculation
      const { amount, area } = calculateItemAmount(item);
      item.amount = amount;
      item.area = area;
      nextItems[itemIdx] = item;
      page.items = nextItems;
      nextPages[pageIdx] = page;
      return { ...prev, pages: nextPages };
    });
  };

  const handleDeleteItem = (pageIdx, itemIdx) => {
    updateBookState(prev => {
      const nextPages = [...prev.pages];
      const page = { ...nextPages[pageIdx] };
      page.items = page.items.filter((_, idx) => idx !== itemIdx);
      nextPages[pageIdx] = page;
      return { ...prev, pages: nextPages };
    });
  };

  // Move item to another page
  const handleMoveItem = destPageId => {
    if (!moveModalItem) return;
    const { item, fromPageId } = moveModalItem;

    updateBookState(prev => {
      const nextPages = prev.pages.map(p => {
        if (p._id === fromPageId) {
          return {
            ...p,
            items: p.items.filter(it => it !== item && it._id !== item._id),
          };
        }
        if (p._id === destPageId) {
          return {
            ...p,
            items: [...p.items, item],
          };
        }
        return p;
      });
      return { ...prev, pages: nextPages };
    });

    setMoveModalItem(null);
  };

  // Payment Operations
  const handleAddPayment = async e => {
    e.preventDefault();
    const amountNum = parseFloat(newPayment.amount);
    if (!amountNum || amountNum <= 0) return;

    try {
      const res = await apiService.addPayment(id, {
        amount: amountNum,
        date: newPayment.date,
        note: newPayment.note,
      });
      setBook(res.data.book);
      setNewPayment({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: 'Cash',
      });
      setPaymentsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add payment');
    }
  };

  const handleDeletePayment = async paymentId => {
    if (!window.confirm(t('deletePaymentConfirm'))) return;
    try {
      const res = await apiService.deletePayment(id, paymentId);
      setBook(res.data.book);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete payment');
    }
  };

  // Delete Book
  const handleDeleteBook = async () => {
    try {
      await apiService.deleteBook(id);
      navigate(`/customers/${book.customerId?._id || ''}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete book');
    }
  };

  // Generate & Download PDF
  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const latestBook = await flushSave();
      const doc = (
        <BillDocument
          book={latestBook}
          settings={settings}
          lang={i18n.language}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const customerName = (latestBook.customerId?.name || 'Customer').replace(/\s+/g, '_');
      const filename = `DeepFurniture_Bill_${latestBook.billNumber}_${customerName}.pdf`;

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
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = async () => {
    setSharingWhatsApp(true);
    try {
      const latestBook = await flushSave();
      const doc = (
        <BillDocument
          book={latestBook}
          settings={settings}
          lang={i18n.language}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const customerName = (latestBook.customerId?.name || 'Customer').replace(/\s+/g, '_');
      const filename = `DeepFurniture_Bill_${latestBook.billNumber}_${customerName}.pdf`;

      await sharePdfToWhatsApp({
        pdfBlob: blob,
        filename,
        customerPhone: latestBook.customerId?.phone,
        customerName: latestBook.customerId?.name,
        message: t('whatsappMessage'),
        onFallback: () => {
          alert(t('manualAttachNotice'));
        },
      });
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to share to WhatsApp');
    } finally {
      setSharingWhatsApp(false);
    }
  };

  // Filtered Catalog for item picker
  const filteredCatalog = useMemo(() => {
    let items = [...catalog].sort((a, b) =>
      a.nameEn.localeCompare(b.nameEn, undefined, { sensitivity: 'base' })
    );
    if (!catalogSearch.trim()) return items;
    const q = catalogSearch.toLowerCase().trim();
    return items.filter(
      item =>
        item.nameEn.toLowerCase().includes(q) ||
        (item.nameGu && item.nameGu.toLowerCase().includes(q))
    );
  }, [catalog, catalogSearch]);

  const getStatusBadge = status => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('paid')}
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t('partial')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            {t('pending')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-8">
        <div className="h-24 bg-white rounded-3xl animate-pulse" />
        <div className="h-64 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Book not found</p>
        <button onClick={() => navigate('/customers')} className="mt-4 px-4 py-2 bg-navy text-white rounded-xl text-sm">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/customers/${book.customerId?._id || ''}`)}
            className="p-2.5 rounded-2xl bg-white border border-cream-300 text-navy hover:text-wood hover:shadow-soft transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-navy text-white px-2.5 py-0.5 rounded-lg">
                {book.billNumber}
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-navy tracking-tight truncate">
                {book.customerId?.name || 'Customer'}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{book.date}</span>
              {book.customerId?.phone && (
                <>
                  <span>•</span>
                  <span>{book.customerId.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status & Autosave Indicator */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Autosave Status Badge */}
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-white border border-cream-300 shadow-soft">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-wood animate-spin" />
                <span className="text-gray-500">{t('saving')}</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <button onClick={flushSave} className="text-rose-600 underline">
                  Save failed — Retry
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-700">{t('saved')}</span>
              </>
            )}
          </div>

          {getStatusBadge(book.status)}
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: EDITOR ON LEFT, LIVE TOTALS ON RIGHT (LAPTOP >= 1024px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PAGES & ITEMS (Span 2 on Laptop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optional Book Title & Date row */}
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-cream-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t('bookTitle')}
              </label>
              <input
                type="text"
                value={book.title || ''}
                onChange={e => {
                  const val = e.target.value;
                  setBook(prev => ({ ...prev, title: val }));
                  triggerAutosave({ ...book, title: val });
                }}
                placeholder="e.g. Full Interior Carpentry Work"
                className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                value={book.date || ''}
                onChange={e => {
                  const val = e.target.value;
                  setBook(prev => ({ ...prev, date: val }));
                  triggerAutosave({ ...book, date: val });
                }}
                className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy text-sm font-medium"
              />
            </div>
          </div>

          {/* PAGES LIST */}
          <div className="space-y-5">
            {book.pages.map((page, pageIdx) => {
              const pageKey = page._id || `page-${pageIdx}`;
              const isCollapsed = collapsedPages[pageKey];

              return (
                <div
                  key={pageKey}
                  className="bg-white rounded-3xl shadow-card border border-cream-300 overflow-hidden transition-all"
                >
                  {/* Page Card Header */}
                  <div className="bg-cream/40 p-4 sm:p-5 border-b border-cream-300 flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-xs font-black bg-wood text-white px-2.5 py-1 rounded-xl shrink-0">
                        P{pageIdx + 1}
                      </span>
                      {/* Free-text Title Input Box */}
                      <input
                        type="text"
                        value={page.title || ''}
                        onChange={e => handlePageTitleChange(pageIdx, e.target.value)}
                        placeholder={`Page ${pageIdx + 1} Title (e.g. Master Bedroom)`}
                        className="w-full font-bold text-navy text-sm sm:text-base bg-transparent border-b border-transparent hover:border-gray-300 focus:border-navy focus:outline-none px-1 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Delete Page button */}
                      {book.pages.length > 1 && (
                        <button
                          onClick={() => handleDeletePage(pageIdx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title={t('deletePage')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Collapse / Expand Toggle */}
                      <button
                        onClick={() => togglePageCollapse(pageKey)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronUp className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Page Body / Items List */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {page.items.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
                          No items added yet to this page.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {page.items.map((item, itemIdx) => {
                            const needsDimensions = item.unit === 'SQ.FT' || item.unit === 'R.F';
                            const needsWidth = item.unit === 'SQ.FT';

                            return (
                              <div
                                key={item._id || itemIdx}
                                className="bg-cream/30 hover:bg-cream/60 border border-cream-300 rounded-2xl p-3.5 sm:p-4 space-y-3 transition-colors"
                              >
                                {/* Item Line Header */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="font-bold text-navy text-sm sm:text-base flex items-center gap-2">
                                    <span className="text-xs text-gray-400 font-mono">
                                      #{itemIdx + 1}
                                    </span>
                                    <span>
                                      {i18n.language === 'gu' && item.nameGu
                                        ? item.nameGu
                                        : item.nameEn}
                                    </span>
                                    <span className="text-[11px] font-semibold bg-navy-100 text-navy-800 px-2 py-0.5 rounded-lg">
                                      {item.unit}
                                    </span>
                                    {item.isCustom && (
                                      <span className="text-[10px] font-semibold bg-wood-100 text-wood-800 px-1.5 py-0.5 rounded">
                                        Custom
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Move Item button */}
                                    {book.pages.length > 1 && (
                                      <button
                                        onClick={() =>
                                          setMoveModalItem({ item, fromPageId: page._id })
                                        }
                                        className="p-1.5 text-gray-400 hover:text-wood hover:bg-white rounded-lg transition-colors"
                                        title={t('moveItem')}
                                      >
                                        <MoveRight className="w-4 h-4" />
                                      </button>
                                    )}

                                    {/* Delete item */}
                                    <button
                                      onClick={() => handleDeleteItem(pageIdx, itemIdx)}
                                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-white rounded-lg transition-colors"
                                      title={t('deleteItem')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Item Fields Grid: Specialized layout per item type */}
                                {(() => {
                                  const isInsideLaminate = item.isInsideLaminate || (item.nameEn && /inside\s*[-–]?\s*laminate/i.test(item.nameEn));
                                  const isRF = item.unit === 'R.F' || item.unit === 'RF' || (item.nameEn && /\(RF\)/i.test(item.nameEn));
                                  const isStandardSqFt = item.unit === 'SQ.FT' && !isInsideLaminate;

                                  // 1. Inside Laminate: Sheet No. | Sq. Feet (SF = sheets * 32) | Price | Total
                                  if (isInsideLaminate) {
                                    const currentSheets = item.sheets !== undefined && item.sheets !== 0 ? item.sheets : (item.qty || 0);
                                    const sqftVal = (currentSheets * 32).toFixed(2);

                                    return (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            Sheet No.
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={currentSheets || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'sheets',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="1"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('sqft')} (SF)
                                          </label>
                                          <div
                                            className="w-full px-2.5 py-2 bg-cream-50/70 border border-cream-300 rounded-xl text-navy text-sm font-bold text-center select-all cursor-default"
                                            title={`${currentSheets} Sheet(s) × 32 = ${sqftVal} sq.ft`}
                                          >
                                            {sqftVal}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            Price (₹)
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.rate || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'rate',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div className="bg-white p-2 border border-cream-300 rounded-xl text-right">
                                          <div className="text-[10px] font-bold text-gray-400 uppercase">
                                            Total (₹)
                                          </div>
                                          <div className="font-black text-navy text-sm truncate">
                                            {formatCurrency(item.amount)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 2. Running Feet (RF): Length (in) | Feet (ft = length / 12) | Price | Total
                                  if (isRF) {
                                    const feetVal = item.length > 0 ? (item.length / 12).toFixed(2) : '0.00';

                                    return (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('length')} (in)
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.length || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'length',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('runningFeet')} (ft)
                                          </label>
                                          <div
                                            className="w-full px-2.5 py-2 bg-cream-50/70 border border-cream-300 rounded-xl text-navy text-sm font-bold text-center select-all cursor-default"
                                            title={`${item.length}" ÷ 12 = ${feetVal} ft`}
                                          >
                                            {feetVal}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            Price (₹)
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.rate || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'rate',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div className="bg-white p-2 border border-cream-300 rounded-xl text-right">
                                          <div className="text-[10px] font-bold text-gray-400 uppercase">
                                            Total (₹)
                                          </div>
                                          <div className="font-black text-navy text-sm truncate">
                                            {formatCurrency(item.amount)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 3. Standard SQ.FT: Length (in) | Width (in) | Sq. Feet | Qty | Rate | Amount
                                  if (isStandardSqFt) {
                                    return (
                                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end">
                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('length')} (in)
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.length || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'length',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('width')} (in)
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.width || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'width',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('sqft')}
                                          </label>
                                          <div
                                            className="w-full px-2.5 py-2 bg-cream-50/70 border border-cream-300 rounded-xl text-navy text-sm font-bold text-center select-all cursor-default"
                                            title={
                                              item.length > 0 && item.width > 0
                                                ? `(${item.length} × ${item.width}) ÷ 144 = ${((item.length * item.width) / 144).toFixed(2)} sq.ft`
                                                : `${t('sqft')}: (L × W) ÷ 144`
                                            }
                                          >
                                            {item.length > 0 && item.width > 0
                                              ? ((item.length * item.width) / 144).toFixed(2)
                                              : '0.00'}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('qty')}
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            step="any"
                                            value={item.qty || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'qty',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                            {t('rate')}
                                          </label>
                                          <input
                                            type="number"
                                            step="any"
                                            value={item.rate || ''}
                                            onChange={e =>
                                              handleItemFieldChange(
                                                pageIdx,
                                                itemIdx,
                                                'rate',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                          />
                                        </div>

                                        <div className="bg-white p-2 border border-cream-300 rounded-xl text-right">
                                          <div className="text-[10px] font-bold text-gray-400 uppercase">
                                            {t('amount')}
                                          </div>
                                          <div className="font-black text-navy text-sm truncate">
                                            {formatCurrency(item.amount)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // 4. NOS and other fixed items
                                  return (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                          {t('qty')}
                                        </label>
                                        <input
                                          type="number"
                                          min="1"
                                          step="any"
                                          value={item.qty || ''}
                                          onChange={e =>
                                            handleItemFieldChange(
                                              pageIdx,
                                              itemIdx,
                                              'qty',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                          {t('rate')}
                                        </label>
                                        <input
                                          type="number"
                                          step="any"
                                          value={item.rate || ''}
                                          onChange={e =>
                                            handleItemFieldChange(
                                              pageIdx,
                                              itemIdx,
                                              'rate',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2.5 py-2 bg-white border border-cream-300 rounded-xl text-navy text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                                        />
                                      </div>

                                      <div className="col-span-2 sm:col-span-1 bg-white p-2 border border-cream-300 rounded-xl text-right">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                                          {t('amount')}
                                        </div>
                                        <div className="font-black text-navy text-sm truncate">
                                          {formatCurrency(item.amount)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Optional item note */}
                                <div>
                                  <input
                                    type="text"
                                    value={item.note || ''}
                                    onChange={e =>
                                      handleItemFieldChange(pageIdx, itemIdx, 'note', e.target.value)
                                    }
                                    placeholder={t('itemNote')}
                                    className="w-full px-3 py-1.5 bg-white/70 border border-cream-300 rounded-xl text-xs text-gray-600 focus:bg-white focus:outline-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Item Button for this page */}
                      <button
                        onClick={() => handleOpenItemPicker(page._id)}
                        className="w-full py-3 bg-cream hover:bg-wood-50 border-2 border-dashed border-cream-300 hover:border-wood text-wood font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('addItem')}</span>
                      </button>

                      {/* Page Total Footer */}
                      <div className="pt-3 border-t border-cream-300 flex items-center justify-between text-navy">
                        <span className="font-bold text-xs sm:text-sm">
                          {page.title || `Page ${pageIdx + 1}`} Total:
                        </span>
                        <span className="font-black text-base sm:text-lg">
                          {formatCurrency(page.pageTotal || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Page Button */}
          <button
            onClick={handleAddPage}
            className="w-full py-3.5 bg-white hover:bg-cream border border-cream-300 text-navy font-bold rounded-3xl shadow-soft flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99]"
          >
            <Plus className="w-5 h-5 text-wood" />
            <span>{t('addPage')}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: STICKY TOTALS / SUMMARY PANEL (Laptop >= 1024px) */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-8">
          {/* Summary Card */}
          <div className="bg-navy text-white rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="font-bold text-base tracking-tight text-white border-b border-navy-700/80 pb-3">
              Bill Summary
            </h3>

            {/* Grand Total */}
            <div>
              <div className="text-xs uppercase tracking-wider text-navy-200">
                {t('grandTotal')}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {formatCurrency(book.grandTotal)}
              </div>
            </div>

            {/* Paid & Balance Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-navy-700/80">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-navy-300">
                  {t('paidTotal')}
                </div>
                <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                  {formatCurrency(book.paidTotal)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-navy-300">
                  {t('balance')}
                </div>
                <div className="text-lg font-extrabold text-rose-300 mt-0.5">
                  {formatCurrency(book.balance)}
                </div>
              </div>
            </div>

            {/* Manage Payments Button */}
            <button
              onClick={() => setPaymentsModalOpen(true)}
              className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-navy-700"
            >
              <CreditCard className="w-4 h-4 text-wood-300" />
              <span>
                {t('payments')} ({book.payments?.length || 0})
              </span>
            </button>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-navy-700/80">
              {/* Generate PDF */}
              <button
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="w-full h-12 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
              >
                {generatingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>{generatingPdf ? t('preparingPdf') : t('generatePdf')}</span>
              </button>

              {/* Share on WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                disabled={sharingWhatsApp}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
              >
                {sharingWhatsApp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{t('shareWhatsApp')}</span>
              </button>
            </div>

            {/* Delete Book button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setDeleteBookModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                {t('deleteBook')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY TOTALS BAR (< 1024px) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-navy text-white px-4 py-2.5 shadow-floating border-t border-navy-700 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase text-navy-200">{t('grandTotal')}</div>
          <div className="text-lg font-black text-white">{formatCurrency(book.grandTotal)}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaymentsModalOpen(true)}
            className="p-2.5 bg-navy-800 text-wood-300 rounded-xl"
            title="Payments"
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-wood text-white font-bold rounded-xl text-xs active:scale-95"
          >
            {generatingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            <span>PDF</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            disabled={sharingWhatsApp}
            className="p-2 bg-emerald-600 text-white font-bold rounded-xl active:scale-95"
            title="WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CATALOG ITEM PICKER & CUSTOM ENTRY MODAL */}
      <AnimatePresence>
        {itemPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-floating relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setItemPickerOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold text-navy mb-1">{t('addItem')}</h2>
              <p className="text-xs text-gray-500 mb-4">
                Choose from standard 26 rates or add a custom item
              </p>

              {/* Mode Toggle: Catalog vs Custom Entry */}
              <div className="flex rounded-2xl bg-cream p-1 mb-4">
                <button
                  onClick={() => setCustomItemMode(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    !customItemMode ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  Standard Catalog (26 Items)
                </button>
                <button
                  onClick={() => setCustomItemMode(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    customItemMode ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  Custom Entry
                </button>
              </div>

              {!customItemMode ? (
                <>
                  {/* Search Catalog */}
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={e => setCatalogSearch(e.target.value)}
                      placeholder={t('searchCatalog')}
                      className="w-full pl-9 pr-3 py-2 bg-cream/50 border border-cream-300 rounded-xl text-xs sm:text-sm text-navy focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Catalog Items List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
                    {filteredCatalog.map(item => (
                      <button
                        key={item._id}
                        onClick={() => handleSelectCatalogItem(item)}
                        className="w-full text-left p-3 rounded-2xl bg-cream/40 hover:bg-wood-50 border border-cream-300 hover:border-wood flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-navy text-xs sm:text-sm truncate">
                            {i18n.language === 'gu' && item.nameGu ? item.nameGu : item.nameEn}
                          </div>
                          {item.nameGu && i18n.language !== 'gu' && (
                            <div className="text-[11px] text-gray-400 truncate">{item.nameGu}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-gray-600">
                            {item.unit}
                          </span>
                          <span className="text-xs font-extrabold text-navy bg-white px-2 py-1 rounded-lg border border-cream-300">
                            ₹{item.defaultRate}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Custom Item Entry Form */
                <form onSubmit={handleAddCustomItem} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Item Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customForm.nameEn}
                      onChange={e => setCustomForm({ ...customForm, nameEn: e.target.value })}
                      placeholder="e.g. Designer Fluted Panel"
                      className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Item Name (Gujarati - Optional)
                    </label>
                    <input
                      type="text"
                      value={customForm.nameGu}
                      onChange={e => setCustomForm({ ...customForm, nameGu: e.target.value })}
                      placeholder="દા.ત. ડિઝાઈનર પેનલ"
                      className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('unit')}
                      </label>
                      <select
                        value={customForm.unit}
                        onChange={e => setCustomForm({ ...customForm, unit: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-semibold focus:bg-white focus:outline-none"
                      >
                        <option value="SQ.FT">SQ.FT (Area)</option>
                        <option value="R.F">R.F (Running Feet)</option>
                        <option value="NOS">NOS (Numbers / Fixed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('rate')} (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={customForm.rate}
                        onChange={e => setCustomForm({ ...customForm, rate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-semibold focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomItemMode(false)}
                      className="px-4 py-2 rounded-2xl border border-cream-300 text-xs font-semibold"
                    >
                      Back to Catalog
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-2xl bg-wood text-white text-xs font-bold shadow-sm"
                    >
                      Add Custom Item
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOVE ITEM MODAL */}
      <AnimatePresence>
        {moveModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-floating relative"
            >
              <button
                onClick={() => setMoveModalItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-bold text-navy text-base mb-1">{t('moveItem')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('moveToPage')}</p>

              <div className="space-y-2">
                {book.pages.map((p, idx) => {
                  const isCurrent = p._id === moveModalItem.fromPageId;
                  if (isCurrent) return null;

                  return (
                    <button
                      key={p._id || idx}
                      onClick={() => handleMoveItem(p._id)}
                      className="w-full p-3 rounded-2xl bg-cream/50 hover:bg-wood hover:text-white border border-cream-300 text-left font-semibold text-xs sm:text-sm text-navy transition-all"
                    >
                      Page {idx + 1}: {p.title || `Page ${idx + 1}`}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENTS MODAL */}
      <AnimatePresence>
        {paymentsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-floating relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setPaymentsModalOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold text-navy mb-1">{t('payments')}</h2>
              <p className="text-xs text-gray-500 mb-4">
                Record advances and stage withdrawals
              </p>

              {/* Add Payment Form */}
              <form onSubmit={handleAddPayment} className="bg-cream/40 p-4 rounded-2xl border border-cream-300 space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('paymentAmount')} *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newPayment.amount}
                      onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                      placeholder="e.g. 10000"
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-sm font-semibold text-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('paymentDate')}
                    </label>
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-sm font-semibold text-navy focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    {t('paymentNote')}
                  </label>
                  <input
                    type="text"
                    value={newPayment.note}
                    onChange={e => setNewPayment({ ...newPayment, note: e.target.value })}
                    placeholder="e.g. Cash / GPay / Cheque"
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs text-navy focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-navy hover:bg-navy-900 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  {t('addPayment')}
                </button>
              </form>

              {/* Payments History List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Payment History
                </h4>
                {(!book.payments || book.payments.length === 0) ? (
                  <p className="text-xs text-gray-400 py-3 text-center">No payment entries yet</p>
                ) : (
                  book.payments.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="p-3 rounded-2xl bg-cream/30 border border-cream-300 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-extrabold text-emerald-700 text-sm">
                          {formatCurrency(p.amount)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {p.date} {p.note && `• ${p.note}`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(p._id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE BOOK MODAL */}
      <AnimatePresence>
        {deleteBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-floating"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">{t('deleteBook')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                {t('deleteBookConfirm')}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteBookModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-cream-300 text-gray-600 font-semibold text-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBook}
                  className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  {t('delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
