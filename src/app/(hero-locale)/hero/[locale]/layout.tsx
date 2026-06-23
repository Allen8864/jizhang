import { RootDocument, rootMetadata, rootViewport } from "@/app/root-shell"
import { heroContent, isHeroLocale } from "@/lib/hero"
import "../../../globals.css"

export const metadata = rootMetadata
export const viewport = rootViewport

interface HeroLocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function HeroLocaleRootLayout({
  children,
  params,
}: HeroLocaleLayoutProps) {
  const { locale } = await params
  const lang = isHeroLocale(locale) ? heroContent[locale].htmlLang : "en"

  return <RootDocument lang={lang}>{children}</RootDocument>
}
