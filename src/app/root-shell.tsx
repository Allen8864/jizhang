import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { LanguageProvider } from "@/lib/i18n"
import {
  SITE_BRAND,
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_SHORT_NAME,
  getSiteUrl,
} from "@/lib/site"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE_DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_SHORT_NAME,
  },
}

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
}

export function RootDocument({
  children,
  lang,
}: Readonly<{
  children: React.ReactNode
  lang: string
}>) {
  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
