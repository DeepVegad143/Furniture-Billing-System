import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, User, Globe, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin, setLanguage } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'gu' ? 'en' : 'gu';
    setLanguage(nextLang);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials or server unavailable';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError('');

    try {
      await demoLogin();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to initialize demo mode';
      setError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Language Switch Top Right */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-soft border border-cream-300 text-xs sm:text-sm font-semibold text-navy hover:bg-cream-100 transition-colors active:scale-95"
        >
          <Globe className="w-4 h-4 text-wood" />
          <span>{i18n.language === 'gu' ? 'ગુજરાતી' : 'English'}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl bg-white shadow-card mb-4">
            <img
              src="/logo.png"
              alt="Deep Furniture Logo"
              className="w-20 sm:w-24 h-auto mx-auto drop-shadow"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            {t('appName')}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {t('tagline')}
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-300">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            {t('login')}
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter Your Username"
                  autoCapitalize="none"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-cream/50 border border-cream-300 rounded-2xl text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Big Login Button */}
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full h-13 mt-2 bg-navy hover:bg-navy-900 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
              style={{ minHeight: '50px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('loggingIn')}</span>
                </>
              ) : (
                <span>{t('login')}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Try Demo Button */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading || demoLoading}
            className="w-full h-13 bg-wood hover:bg-wood-600 text-white font-bold rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ minHeight: '50px' }}
          >
            {demoLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>{t('tryDemo')}</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Deep Furniture. Built for mobile simplicity.
        </p>
      </motion.div>
    </div>
  );
}
