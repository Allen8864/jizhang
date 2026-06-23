import type { Metadata } from 'next'
import {
  SITE_BRAND,
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_SHORT_NAME,
  getAbsoluteUrl,
  getOgImageUrl,
  getSiteUrl,
} from './site'

export const publicRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
} satisfies Metadata['robots']

export const privateRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies Metadata['robots']

export function createHomeMetadata(): Metadata {
  const imageUrl = getOgImageUrl('zh')

  return {
    metadataBase: new URL(getSiteUrl()),
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: SITE_BRAND,
    alternates: {
      canonical: '/',
    },
    robots: publicRobots,
    openGraph: {
      type: 'website',
      url: getAbsoluteUrl('/'),
      siteName: SITE_BRAND,
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
      locale: 'zh_CN',
      alternateLocale: ['en_US'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: SITE_DEFAULT_TITLE,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
      images: [imageUrl],
    },
  }
}

export function createHomeJsonLd() {
  const rootUrl = getAbsoluteUrl('/')
  const softwareId = `${rootUrl}#software`
  const websiteId = `${rootUrl}#website`
  const webpageId = `${rootUrl}#webpage`
  const brandId = `${rootUrl}#brand`
  const imageUrl = getOgImageUrl('zh')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        '@id': brandId,
        name: SITE_BRAND,
        alternateName: [SITE_SHORT_NAME, 'Game Ledger', '打牌记账'],
        url: rootUrl,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': softwareId,
        name: '打牌记账',
        alternateName: ['Jizhang', 'Game Ledger', SITE_BRAND],
        applicationCategory: 'GameApplication',
        applicationSubCategory: 'Scorekeeping and settlement tracker',
        operatingSystem: 'Web',
        url: rootUrl,
        inLanguage: ['zh-CN', 'en-US'],
        description: SITE_DESCRIPTION,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Create a temporary game room',
          'Join by 4-digit room code',
          'Track score changes by round',
          'Sync scores live across players',
          'Calculate minimum final settlement transfers',
          'Save settled game history',
        ],
        keywords: SITE_KEYWORDS.join(', '),
        image: imageUrl,
        screenshot: imageUrl,
        browserRequirements:
          'Requires a modern web browser with JavaScript enabled for room creation and live sync.',
        audience: {
          '@type': 'Audience',
          audienceType:
            'Mahjong, poker, board game, party game, and game night players',
        },
        brand: {
          '@id': brandId,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: rootUrl,
        name: SITE_BRAND,
        alternateName: ['打牌记账', 'Game Ledger'],
        description: SITE_DESCRIPTION,
        inLanguage: ['zh-CN', 'en-US'],
        about: {
          '@id': softwareId,
        },
        publisher: {
          '@id': brandId,
        },
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: rootUrl,
        name: SITE_DEFAULT_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: 'zh-CN',
        isPartOf: {
          '@id': websiteId,
        },
        mainEntity: {
          '@id': softwareId,
        },
      },
    ],
  }
}

export function createPrivatePageMetadata(title: string): Metadata {
  return {
    title,
    robots: privateRobots,
  }
}
