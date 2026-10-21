import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DemoBanner() {
  const { isDemo } = useAuth();
  const { t } = useTranslation();

  if (!isDemo) return null;

  return (
    <div className="w-full bg-wood text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm border-b border-wood-600 mb-6 shrink-0">
      <Sparkles className="w-4 h-4 shrink-0 text-amber-200" />
      <span className="truncate">{t('demoMode')}</span>
    </div>
  );
}
