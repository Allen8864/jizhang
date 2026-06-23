import type { Metadata } from 'next'
import { createPrivatePageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPrivatePageMetadata('Private room - Jizhang')

export default function RoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
