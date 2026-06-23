import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { detectHeroLocaleFromAcceptLanguage } from '@/lib/hero'

export const dynamic = 'force-dynamic'

async function getRedirectLocale() {
  const requestHeaders = await headers()
  return detectHeroLocaleFromAcceptLanguage(requestHeaders.get('accept-language'))
}

export default async function HeroPage() {
  const locale = await getRedirectLocale()
  redirect(`/hero/${locale}`)
}
