import { RootDocument, rootMetadata, rootViewport } from "@/app/root-shell"
import "../globals.css"

export const metadata = rootMetadata
export const viewport = rootViewport

export default function MainRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RootDocument lang="zh-CN">{children}</RootDocument>
}
