import type { Metadata } from 'next'
import { createPrivatePageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPrivatePageMetadata('History - Jizhang')

export default function HistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
