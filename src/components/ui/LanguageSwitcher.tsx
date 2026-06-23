'use client'

import { useI18n, type Language } from '@/lib/i18n'

interface LanguageSwitcherProps {
  value?: Language
  onChange?: (language: Language) => void
  className?: string
}

export function LanguageSwitcher({
  value,
  onChange,
  className = '',
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n()
  const selectedLanguage = value ?? language
  const nextLanguage: Language = selectedLanguage === 'zh' ? 'en' : 'zh'

  const handleChange = () => {
    if (onChange) {
      onChange(nextLanguage)
      return
    }
    setLanguage(nextLanguage)
  }

  return (
    <div
      className={`language-switcher-control ${className}`}
      role="radiogroup"
      aria-label={t.common.switchLanguage}
    >
      <span
        className={`language-switcher-thumb ${selectedLanguage === 'en' ? 'language-switcher-thumb-en' : ''}`}
        aria-hidden="true"
      />
      <button
        type="button"
        role="radio"
        aria-checked={selectedLanguage === 'zh'}
        onClick={() => {
          if (selectedLanguage !== 'zh') handleChange()
        }}
        className={`language-switcher-choice language-switcher-choice-zh ${
          selectedLanguage === 'zh' ? 'language-switcher-choice-active' : ''
        }`}
      >
        中
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={selectedLanguage === 'en'}
        onClick={() => {
          if (selectedLanguage !== 'en') handleChange()
        }}
        className={`language-switcher-choice language-switcher-choice-en ${
          selectedLanguage === 'en' ? 'language-switcher-choice-active' : ''
        }`}
      >
        EN
      </button>
    </div>
  )
}
