import type { Metadata } from 'next'
import { HomeApp } from '@/components/home/HomeApp'
import { createHomeJsonLd, createHomeMetadata } from '@/lib/seo'

export const metadata: Metadata = createHomeMetadata()

export default function HomePage() {
  const jsonLd = createHomeJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeApp />
    </>
  )
}
