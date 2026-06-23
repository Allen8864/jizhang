'use client'

import Link from 'next/link'

export type LanguageSegmentValue = 'zh' | 'en'

interface LanguageLink {
  href: string
  hrefLang?: string
}

interface LanguageSegmentedControlProps {
  value: LanguageSegmentValue
  ariaLabel: string
  className?: string
  tone?: 'light' | 'dark'
  links?: Partial<Record<LanguageSegmentValue, LanguageLink>>
  onValueChange?: (value: LanguageSegmentValue) => void
}

const options: Array<{ value: LanguageSegmentValue; label: string; ariaLabel: string }> = [
  { value: 'zh', label: '中', ariaLabel: '中文' },
  { value: 'en', label: 'EN', ariaLabel: 'English' },
]

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(' ')

export function LanguageSegmentedControl({
  value,
  ariaLabel,
  className = '',
  tone = 'light',
  links,
  onValueChange,
}: LanguageSegmentedControlProps) {
  const isDark = tone === 'dark'
  const containerRole = links ? 'group' : 'radiogroup'

  const containerClass = cx(
    'relative flex h-[38px] w-[88px] overflow-hidden rounded-lg p-[3px]',
    isDark
      ? 'bg-[rgba(2,44,34,0.5)] ring-1 ring-inset ring-[rgba(236,253,245,0.22)]'
      : 'bg-gray-100',
    className,
  )

  const sliderClass = cx(
    'absolute left-[3px] top-1/2 h-8 w-[41px] -translate-y-1/2 rounded-md border transition-transform duration-200 ease-out',
    isDark ? 'border-transparent bg-[#ecfdf5]' : 'border-gray-200 bg-white',
    value === 'en' && 'translate-x-[41px]',
  )

  const itemClass = (itemValue: LanguageSegmentValue) => {
    const active = value === itemValue

    return cx(
      'relative z-[1] inline-grid h-8 w-[41px] appearance-none place-items-center rounded-md border border-transparent bg-transparent p-0 text-[13px] font-bold leading-none tracking-normal no-underline transition-colors duration-200 ease-in',
      active
        ? (isDark ? 'text-[#047857] hover:text-[#047857]' : 'text-emerald-600 hover:text-emerald-600')
        : (isDark ? 'text-emerald-50/80 hover:text-emerald-50' : 'text-gray-500 hover:text-gray-600'),
    )
  }

  return (
    <div className={containerClass} role={containerRole} aria-label={ariaLabel}>
      <span className={sliderClass} aria-hidden="true" />
      {options.map((option) => {
        const link = links?.[option.value]
        const active = value === option.value

        if (link) {
          return (
            <Link
              key={option.value}
              href={link.href}
              hrefLang={link.hrefLang}
              aria-current={active ? 'page' : undefined}
              aria-label={option.ariaLabel}
              className={itemClass(option.value)}
            >
              {option.label}
            </Link>
          )
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.ariaLabel}
            onClick={() => {
              if (!active) onValueChange?.(option.value)
            }}
            className={itemClass(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
