import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function ColdStartScreen() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream px-6 py-12 text-center">
      {/* Animated Logo */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="mb-8"
      >
        <img
          src="/logo.png"
          alt="Deep Furniture"
          className="w-24 h-auto mx-auto drop-shadow-md"
        />
      </motion.div>

      {/* Brand Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight mb-2">
        {t('appName')}
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-sm">
        {t('tagline')}
      </p>

      {/* Spinner & Message */}
      <div className="bg-white rounded-2xl p-6 shadow-card max-w-md w-full flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-wood animate-spin mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-navy mb-2">
          {t('wakingServer')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          {t('wakingSubtext')}
        </p>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        Secure & Automated Data Sync
      </div>
    </div>
  );
}
