'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  HTML_LANG,
  LANGUAGE_LOCALES,
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
  type Translation,
} from './translations'

interface LanguageContextValue {
  language: Language
  locale: string
  t: Translation
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function isLanguage(value: string | null): value is Language {
  return value === 'zh' || value === 'en'
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'

  const languages = window.navigator.languages?.length
    ? window.navigator.languages
    : [window.navigator.language]

  const firstMatch = languages.find(Boolean)?.toLowerCase() || ''
  return firstMatch.startsWith('zh') ? 'zh' : 'en'
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // Ignore storage access errors and fall back to browser language.
  }

  return detectBrowserLanguage()
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLanguageState(getInitialLanguage())
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language]
  }, [language])

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    } catch {
      // The UI should still switch when localStorage is unavailable.
    }
  }, [])

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale: LANGUAGE_LOCALES[language],
    t: translations[language],
    setLanguage,
  }), [language, setLanguage])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useI18n must be used inside LanguageProvider')
  }
  return context
}
