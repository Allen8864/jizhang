'use client'

import { useI18n, type Language } from '@/lib/i18n'

interface LanguageSwitcherProps {
  value?: Language
  onChange?: (language: Language) => void
  className?: string
}

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ')

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
      className={cx(
        'relative block h-[34px] w-20 overflow-hidden rounded-full border border-transparent bg-gray-100',
        className,
      )}
      role="radiogroup"
      aria-label={t.common.switchLanguage}
    >
      <span
        className={cx(
          'absolute left-0.5 top-0.5 h-7 w-[37px] rounded-full border border-gray-200 bg-white transition-transform duration-200 ease-out',
          selectedLanguage === 'en' && 'translate-x-[37px]',
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        role="radio"
        aria-checked={selectedLanguage === 'zh'}
        onClick={() => {
          if (selectedLanguage !== 'zh') handleChange()
        }}
        className={cx(
          'absolute left-0.5 top-0.5 z-[1] grid h-7 w-[37px] appearance-none place-items-center rounded-full border-0 bg-transparent p-0 text-[13px] font-bold leading-none tracking-normal transition-colors duration-200 ease-in',
          selectedLanguage === 'zh' ? 'text-emerald-600' : 'text-gray-500',
        )}
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
        className={cx(
          'absolute left-[39px] top-0.5 z-[1] grid h-7 w-[37px] appearance-none place-items-center rounded-full border-0 bg-transparent p-0 text-[13px] font-bold leading-none tracking-normal transition-colors duration-200 ease-in',
          selectedLanguage === 'en' ? 'text-emerald-600' : 'text-gray-500',
        )}
      >
        EN
      </button>
    </div>
  )
}
