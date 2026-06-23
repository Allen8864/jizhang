'use client'

import { MotionIcon } from 'motion-icons-react'
import { useI18n, type Language } from '@/lib/i18n'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n()

  const nextLanguage: Language = language === 'zh' ? 'en' : 'zh'

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white text-gray-500 hover:text-emerald-600 hover:bg-gray-100 border border-gray-100 transition-colors ${className}`}
      aria-label={t.common.switchLanguage}
      title={t.common.switchLanguage}
    >
      <MotionIcon
        name="Languages"
        size={22}
        animation="swing"
        trigger="hover"
        interactive
        aria-label={t.common.switchLanguage}
      />
    </button>
  )
}
