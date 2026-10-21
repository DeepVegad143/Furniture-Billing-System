import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Building,
  Phone,
  FileSpreadsheet,
  Download,
  Globe,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X
} from 'lucide-react';
import { apiService } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, logout, setLanguage } = useAuth();

  const [settings, setSettings] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  // Add Item Modal
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    nameEn: '',
    nameGu: '',
    unit: 'SQ.FT',
    defaultRate: 200,
  });
  const [addingItem, setAddingItem] = useState(false);

  // Logout confirmation modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, catalogRes] = await Promise.all([
          apiService.getSettings(),
          apiService.getCatalog(),
        ]);
        setSettings(settingsRes.data.settings);
        setCatalog(catalogRes.data.items);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSettingsSubmit = async e => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveNotice('');
    try {
      const res = await apiService.updateSettings(settings);
      setSettings(res.data.settings);
      setSaveNotice('Settings updated successfully!');
      setTimeout(() => setSaveNotice(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRateUpdate = async (item, newRate) => {
    const rateNum = parseFloat(newRate);
    if (isNaN(rateNum) || rateNum < 0) return;

    try {
      const res = await apiService.updateCatalogItem(item._id, { defaultRate: rateNum });
      setCatalog(prev => prev.map(it => (it._id === item._id ? res.data.item : it)));
    } catch (err) {
      console.error('Rate update error:', err);
    }
  };

  const handleToggleItemActive = async item => {
    try {
      const res = await apiService.updateCatalogItem(item._id, { isActive: !item.isActive });
      setCatalog(prev => prev.map(it => (it._id === item._id ? res.data.item : it)));
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleAddNewItem = async e => {
    e.preventDefault();
    if (!newItem.nameEn.trim()) return;

    setAddingItem(true);
    try {
      const res = await apiService.createCatalogItem({
        nameEn: newItem.nameEn.trim(),
        nameGu: newItem.nameGu.trim(),
        unit: newItem.unit,
        defaultRate: Number(newItem.defaultRate) || 0,
      });
      setCatalog(prev => [...prev, res.data.item]);
      setAddItemModalOpen(false);
      setNewItem({ nameEn: '', nameGu: '', unit: 'SQ.FT', defaultRate: 200 });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      const response = await apiService.downloadExcel();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DeepFurniture_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to export data to Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
        <div className="h-96 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-wood" />
            <span>{t('navSettings')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Manage business profile, default pricing, and backups
          </p>
        </div>

        <button
          onClick={() => setLogoutModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl text-xs sm:text-sm border border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>

      {saveNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </motion.div>
      )}

      {/* LANGUAGE SELECTOR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-cream-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cream text-wood">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-navy text-sm sm:text-base">
              {t('languageSetting')}
            </h3>
            <p className="text-xs text-gray-400">
              App UI, item descriptions, and PDF output
            </p>
          </div>
        </div>

        <div className="flex rounded-2xl bg-cream p-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              i18n.language !== 'gu'
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-navy'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('gu')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              i18n.language === 'gu'
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-navy'
            }`}
          >
            ગુજરાતી
          </button>
        </div>
      </div>

      {/* BUSINESS INFO FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-300">
        <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-wood" />
          <span>{t('businessInfo')}</span>
        </h3>

        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t('businessName')} *
              </label>
              <input
                type="text"
                required
                value={settings?.businessName || ''}
                onChange={e => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t('ownerPhone')} *
              </label>
              <input
                type="tel"
                required
                value={settings?.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-navy hover:bg-navy-900 text-white font-bold rounded-2xl text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{savingSettings ? t('saving') : t('save')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* DEFAULT PRICES EDITOR (26 CATALOG ITEMS) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-wood" />
              <span>{t('defaultPrices')}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('defaultPricesSubtitle')}
            </p>
          </div>

          <button
            onClick={() => setAddItemModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl text-xs shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addCatalogItem')}</span>
          </button>
        </div>

        {/* Catalog items list */}
        <div className="divide-y divide-cream-300 max-h-[500px] overflow-y-auto pr-1">
          {catalog.map((item, idx) => (
            <div
              key={item._id}
              className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 rounded-xl transition-colors ${
                !item.isActive ? 'opacity-50 bg-gray-50' : 'hover:bg-cream/40'
              }`}
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
                  {item.unit}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    defaultValue={item.defaultRate}
                    onBlur={e => handleRateUpdate(item, e.target.value)}
                    className="w-20 px-2 py-1 bg-cream/50 border border-cream-300 rounded-xl text-navy font-bold text-xs text-center focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleToggleItemActive(item)}
                  className={`p-1.5 rounded-lg ${
                    item.isActive ? 'text-gray-400 hover:text-navy' : 'text-amber-600 bg-amber-50'
                  }`}
                  title={item.isActive ? 'Hide Item' : 'Unhide Item'}
                >
                  {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORT TO EXCEL BACKUP */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-navy text-base flex items-center gap-2">
            <Download className="w-5 h-5 text-wood" />
            <span>{t('exportExcel')}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            {t('exportExcelSubtitle')}
          </p>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={downloadingExcel}
          className="h-12 px-6 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm active:scale-95 transition-all shrink-0"
        >
          {downloadingExcel ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{downloadingExcel ? t('downloadingExcel') : 'Download Excel Backup'}</span>
        </button>
      </div>

      {/* ADD CATALOG ITEM MODAL */}
      <AnimatePresence>
        {addItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-floating relative"
            >
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-bold text-navy text-lg mb-1">{t('addCatalogItem')}</h3>
              <p className="text-xs text-gray-400 mb-4">Add a new standard item to catalog</p>

              <form onSubmit={handleAddNewItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Item Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.nameEn}
                    onChange={e => setNewItem({ ...newItem, nameEn: e.target.value })}
                    placeholder="e.g. Fluted Panel"
                    className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Item Name (Gujarati)
                  </label>
                  <input
                    type="text"
                    value={newItem.nameGu}
                    onChange={e => setNewItem({ ...newItem, nameGu: e.target.value })}
                    placeholder="દા.ત. ફ્લુટેડ પેનલ"
                    className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {t('unit')}
                    </label>
                    <select
                      value={newItem.unit}
                      onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-semibold focus:outline-none"
                    >
                      <option value="SQ.FT">SQ.FT</option>
                      <option value="R.F">R.F</option>
                      <option value="NOS">NOS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Default Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.defaultRate}
                      onChange={e => setNewItem({ ...newItem, defaultRate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream/50 border border-cream-300 rounded-2xl text-navy text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddItemModalOpen(false)}
                    className="px-4 py-2 rounded-2xl border border-cream-300 text-xs font-semibold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={addingItem}
                    className="px-5 py-2 bg-navy hover:bg-navy-900 text-white rounded-2xl text-xs font-bold shadow-sm"
                  >
                    {addingItem ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-floating"
            >
              <h3 className="text-lg font-bold text-navy mb-2">{t('logout')}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">{t('logoutConfirm')}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-cream-300 text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={logout}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-sm"
                >
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
