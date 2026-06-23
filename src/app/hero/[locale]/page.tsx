import { notFound } from 'next/navigation'
import { HeroLandingPage } from '@/components/hero/HeroLandingPage'
import {
  HERO_LOCALES,
  createHeroMetadata,
  getHeroCanonicalPath,
  isHeroLocale,
} from '@/lib/hero'

interface HeroLocalePageProps {
  params: Promise<{
    locale: string
  }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return HERO_LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: HeroLocalePageProps) {
  const { locale } = await params
  if (!isHeroLocale(locale)) return {}

  return createHeroMetadata(locale, getHeroCanonicalPath(locale))
}

export default async function HeroLocalePage({ params }: HeroLocalePageProps) {
  const { locale } = await params

  if (!isHeroLocale(locale)) {
    notFound()
  }

  return (
    <HeroLandingPage
      locale={locale}
      canonicalPath={getHeroCanonicalPath(locale)}
    />
  )
}
