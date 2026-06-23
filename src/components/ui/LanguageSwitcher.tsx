'use client'

import { LanguageSegmentedControl } from '@/components/ui/LanguageSegmentedControl'
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

  const handleChange = (nextLanguage: Language) => {
    if (onChange) {
      onChange(nextLanguage)
      return
    }
    setLanguage(nextLanguage)
  }

  return (
    <LanguageSegmentedControl
      value={selectedLanguage}
      onValueChange={handleChange}
      ariaLabel={t.common.switchLanguage}
      className={className}
    />
  )
}
