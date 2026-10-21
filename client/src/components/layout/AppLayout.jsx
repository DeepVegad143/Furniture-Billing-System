import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Plus,
  FileSpreadsheet,
  Settings,
  LogOut,
  Globe,
  UserPlus,
  FilePlus,
  Calculator,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DemoBanner from './DemoBanner';

export default function AppLayout() {
  const { user, logout, setLanguage } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'gu' ? 'en' : 'gu';
    setLanguage(nextLang);
  };

  const navItems = [
    { name: t('navHome'), path: '/', icon: Home },
    { name: t('navCustomers'), path: '/customers', icon: Users },
    { name: t('navRates'), path: '/billing-rate', icon: FileSpreadsheet },
    { name: t('navSettings'), path: '/settings', icon: Settings },
  ];

  const handleQuickAction = route => {
    setQuickActionsOpen(false);
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="flex flex-1 w-full">
        {/* DESKTOP SIDEBAR (>= 1024px) */}
        <aside className="hidden lg:flex flex-col w-64 bg-navy text-white shrink-0 shadow-xl fixed inset-y-0 left-0 z-30">
          {/* Brand Header (No logo image on navy, elegant wood monogram badge) */}
          <div className="p-6 border-b border-navy-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-wood text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
              DF
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                {t('appName')}
              </h1>
              <p className="text-xs text-wood-300 font-medium">Billing & Quotes</p>
            </div>
          </div>

          {/* Quick Action Button in Sidebar */}
          <div className="px-5 pt-5 pb-2">
            <button
              onClick={() => setQuickActionsOpen(true)}
              className="w-full h-12 bg-wood hover:bg-wood-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{t('quickActions')}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-wood text-white shadow-md'
                      : 'text-navy-100 hover:bg-navy-700/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Controls (Language + Logout) */}
          <div className="p-4 border-t border-navy-700/60 space-y-2 bg-navy-900/40">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-sm font-medium text-navy-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-wood-300" />
                <span>{i18n.language === 'gu' ? 'ગુજરાતી' : 'English'}</span>
              </span>
              <span className="text-xs bg-navy-700 text-wood-300 px-2 py-0.5 rounded-full font-semibold">
                {i18n.language === 'gu' ? 'Switch EN' : 'Switch ગુજરાતી'}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col lg:pl-64 w-full min-w-0">
          {/* Demo banner flows at top of content without covering sidebar or page titles */}
          <DemoBanner />

          {/* MOBILE/TABLET TOP HEADER (< 1024px) */}
          <header className="lg:hidden sticky top-0 z-30 bg-navy text-white px-4 py-3 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-wood text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                DF
              </div>
              <div className="truncate">
                <span className="text-base font-bold text-white tracking-tight block truncate">
                  {t('appName')}
                </span>
              </div>
            </div>

            {/* Language toggle on mobile header */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-700/80 hover:bg-navy-600 text-xs font-semibold text-wood-200 active:scale-95 transition-transform"
            >
              <Globe className="w-3.5 h-3.5 text-wood-300" />
              <span>{i18n.language === 'gu' ? 'ગુજરાતી' : 'EN'}</span>
            </button>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12">
            <Outlet />
          </main>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy text-white border-t border-navy-700/60 shadow-floating px-2 py-1 pb-safe">
        <div className="grid grid-cols-5 items-center relative h-16">
          {/* Nav Item 1: Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full text-xs font-medium transition-colors ${
                isActive ? 'text-wood-300' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate max-w-[60px]">{t('navHome')}</span>
          </NavLink>

          {/* Nav Item 2: Customers */}
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full text-xs font-medium transition-colors ${
                isActive ? 'text-wood-300' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate max-w-[60px]">{t('navCustomers')}</span>
          </NavLink>

          {/* Nav Item 3 (CENTER): Large '+' Quick Actions Button */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => setQuickActionsOpen(true)}
              aria-label={t('quickActions')}
              className="w-13 h-13 -mt-6 bg-wood text-white rounded-full flex items-center justify-center shadow-floating border-4 border-cream hover:bg-wood-600 active:scale-90 transition-all"
              style={{ width: '54px', height: '54px' }}
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Nav Item 4: Billing Rate */}
          <NavLink
            to="/billing-rate"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full text-xs font-medium transition-colors ${
                isActive ? 'text-wood-300' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate max-w-[60px]">{t('navRates')}</span>
          </NavLink>

          {/* Nav Item 5: Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full text-xs font-medium transition-colors ${
                isActive ? 'text-wood-300' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] truncate max-w-[60px]">{t('navSettings')}</span>
          </NavLink>
        </div>
      </nav>

      {/* QUICK ACTIONS MODAL / BOTTOM SHEET */}
      <AnimatePresence>
        {quickActionsOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-floating relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickActionsOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-navy mb-1">{t('quickActions')}</h2>
              <p className="text-xs text-gray-500 mb-6">Create new entries quickly</p>

              <div className="space-y-3">
                {/* 1. New Customer */}
                <button
                  onClick={() => handleQuickAction('/customers?action=new')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-cream hover:bg-wood-50 border border-cream-300 hover:border-wood text-left transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-wood text-white flex items-center justify-center shrink-0 shadow-sm">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy text-base">{t('newCustomer')}</h3>
                    <p className="text-xs text-gray-500">Save a new client to database</p>
                  </div>
                </button>

                {/* 2. New Book */}
                <button
                  onClick={() => handleQuickAction('/customers?action=pick_for_book')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-cream hover:bg-wood-50 border border-cream-300 hover:border-wood text-left transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FilePlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy text-base">{t('newBook')}</h3>
                    <p className="text-xs text-gray-500">Start a multi-page job bill</p>
                  </div>
                </button>

                {/* 3. Billing Rate */}
                <button
                  onClick={() => handleQuickAction('/billing-rate')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-cream hover:bg-wood-50 border border-cream-300 hover:border-wood text-left transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-wood-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy text-base">{t('billingRate')}</h3>
                    <p className="text-xs text-gray-500">Create a rate quotation PDF</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
