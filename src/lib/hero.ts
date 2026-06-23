import type { Metadata } from 'next'
import {
  SITE_BRAND,
  getAbsoluteUrl,
  getOgImageUrl,
  getSiteUrl,
} from './site'
import { publicRobots } from './seo'

export const HERO_LOCALES = ['en', 'zh'] as const

export type HeroLocale = (typeof HERO_LOCALES)[number]

export interface HeroFeature {
  title: string
  body: string
  marker: string
}

export interface HeroUseCase {
  name: string
  body: string
}

export interface HeroFaq {
  question: string
  answer: string
}

export interface HeroContent {
  locale: HeroLocale
  htmlLang: string
  schemaLanguage: string
  path: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  brand: string
  eyebrow: string
  headline: string
  lead: string
  proof: string[]
  primaryCta: string
  secondaryCta: string
  navFeatures: string
  navUseCases: string
  navFaq: string
  languageLabel: string
  joinLabel: string
  joinPlaceholder: string
  joinButton: string
  joinError: string
  preview: {
    roomCodeLabel: string
    roomCode: string
    live: string
    round: string
    tableTitle: string
    settlementTitle: string
    settlementHint: string
    transfer: string
    players: Array<{
      emoji: string
      name: string
      amount: string
      tone: 'positive' | 'negative' | 'neutral'
    }>
    rounds: Array<{
      label: string
      east: string
      south: string
      west: string
      north: string
    }>
  }
  metrics: Array<{
    value: string
    label: string
  }>
  featuresTitle: string
  featuresLead: string
  features: HeroFeature[]
  useCasesTitle: string
  useCasesLead: string
  useCases: HeroUseCase[]
  faqTitle: string
  faqLead: string
  faq: HeroFaq[]
  finalCtaTitle: string
  finalCtaBody: string
  schemaApplicationName: string
  schemaAlternateName: string
  schemaCategory: string
}

export const heroContent: Record<HeroLocale, HeroContent> = {
  en: {
    locale: 'en',
    htmlLang: 'en',
    schemaLanguage: 'en-US',
    path: '/hero/en',
    title: 'Game Ledger',
    metaTitle: 'Game Ledger - Real-time Mahjong and Poker Score Tracker',
    metaDescription:
      'A free real-time score and settlement tracker for mahjong, poker, board games, and game nights. Create rooms, track rounds, sync live, and settle automatically.',
    keywords: [
      'game ledger',
      'mahjong score tracker',
      'poker settlement app',
      'real-time score tracking',
      'game night score tracker',
      'automatic settlement tracker',
      'room code game tracker',
    ],
    brand: 'Jizhang / Game Ledger',
    eyebrow: 'Real-time score and settlement tracker',
    headline: 'Run the table. Settle the night.',
    lead:
      'Create a room, invite friends with a 4-digit code, track every round live, and let Game Ledger calculate the cleanest final settlement for mahjong, poker, board games, and shared score nights.',
    proof: ['No registration', '2-8 players', 'Live sync', 'Ad-free'],
    primaryCta: 'Start tracking',
    secondaryCta: 'See how it works',
    navFeatures: 'Features',
    navUseCases: 'Use cases',
    navFaq: 'FAQ',
    languageLabel: 'Language',
    joinLabel: 'Already have a room code?',
    joinPlaceholder: '1234',
    joinButton: 'Join room',
    joinError: 'Enter a 4-digit room code.',
    preview: {
      roomCodeLabel: 'Room code',
      roomCode: '4826',
      live: 'Live sync',
      round: 'Round 6',
      tableTitle: 'Score board',
      settlementTitle: 'Automatic settlement',
      settlementHint: 'Minimum transfers calculated instantly',
      transfer: 'Alex pays Mia 24',
      players: [
        { emoji: '🀄', name: 'Mia', amount: '+86', tone: 'positive' },
        { emoji: '♠️', name: 'Alex', amount: '-42', tone: 'negative' },
        { emoji: '🎲', name: 'Noah', amount: '+18', tone: 'positive' },
        { emoji: '♦️', name: 'Ivy', amount: '-62', tone: 'negative' },
      ],
      rounds: [
        { label: 'R4', east: '+18', south: '-12', west: '+6', north: '-12' },
        { label: 'R5', east: '+32', south: '-18', west: '0', north: '-14' },
        { label: 'R6', east: '+36', south: '-12', west: '+12', north: '-36' },
      ],
    },
    metrics: [
      { value: '4-digit', label: 'room codes' },
      { value: 'live', label: 'score sync' },
      { value: '1 tap', label: 'settlement plan' },
    ],
    featuresTitle: 'Built for the table, not a spreadsheet',
    featuresLead:
      'The page stays focused on the flow people actually need during a game night: invite, record, compare, and settle.',
    features: [
      {
        title: 'Create room',
        body: 'Start a temporary room for a game session without asking players to register.',
        marker: '01',
      },
      {
        title: 'Join by code',
        body: 'Share a short 4-digit room code or link so friends can enter from any mobile browser.',
        marker: '02',
      },
      {
        title: 'Round tracking',
        body: 'Keep scores grouped by round so the history is readable when the game gets busy.',
        marker: '03',
      },
      {
        title: 'Live sync',
        body: 'Players see room, score, countdown, and transaction updates in real time.',
        marker: '04',
      },
      {
        title: 'Automatic settlement',
        body: 'Balances are reduced to the minimum transfer plan at the end of the room.',
        marker: '05',
      },
      {
        title: 'History',
        body: 'Settled rooms save snapshots with results, win rate, and total profit or loss.',
        marker: '06',
      },
    ],
    useCasesTitle: 'One ledger for messy games',
    useCasesLead:
      'Use it anywhere the group needs shared scores, payments, or settlement without chips and manual math.',
    useCases: [
      {
        name: 'Mahjong',
        body: 'Track round results, table balances, and final transfers for 4-player sessions.',
      },
      {
        name: 'Poker',
        body: 'Record buy-ins, pay-outs, or score changes when physical chips are not enough.',
      },
      {
        name: 'Board games',
        body: 'Keep a shared ledger for games where points or penalties move between players.',
      },
      {
        name: 'Shared score tracking',
        body: 'Use a lightweight room for dinner games, party games, or any small-group score night.',
      },
    ],
    faqTitle: 'FAQ',
    faqLead:
      'Short answers for search engines, AI summaries, and players opening the page at the table.',
    faq: [
      {
        question: 'Do players need to register?',
        answer:
          'No. Game Ledger uses anonymous login so players can create or join a room without a full account.',
      },
      {
        question: 'How do room codes work?',
        answer:
          'A room has a short 4-digit code. The host can share the code, a link, or a QR code with other players.',
      },
      {
        question: 'How does settlement work?',
        answer:
          'The app calculates each player balance from recorded transactions, then creates a minimum transfer plan so the room can be settled cleanly.',
      },
      {
        question: 'Is game history saved?',
        answer:
          'When a room is settled, the app saves a settlement snapshot with player results and personal stats.',
      },
      {
        question: 'Does it work on mobile?',
        answer:
          'Yes. Game Ledger is designed mobile-first and works in regular mobile browsers without installing an app.',
      },
    ],
    finalCtaTitle: 'Start a clean game ledger before the first round',
    finalCtaBody:
      'Open a room, share the code, and let everyone watch the score move in real time.',
    schemaApplicationName: 'Game Ledger',
    schemaAlternateName: 'Jizhang',
    schemaCategory: 'GameApplication',
  },
  zh: {
    locale: 'zh',
    htmlLang: 'zh-CN',
    schemaLanguage: 'zh-CN',
    path: '/hero/zh',
    title: '打牌记账',
    metaTitle: '打牌记账 - 麻将扑克实时记分和自动结算工具',
    metaDescription:
      '免费在线打牌记账工具，适合麻将、扑克、桌游和朋友局。创建房间、房间号加入、轮次记录、多人实时同步、自动结算、历史战绩。',
    keywords: [
      '打牌记账',
      '麻将记分器',
      '扑克结算工具',
      '实时记分',
      '游戏记账',
      '自动结算',
      '房间号记账',
    ],
    brand: '打牌记账 / Game Ledger',
    eyebrow: '多人实时记分与自动结算',
    headline: '开局就同步，收局自动算清。',
    lead:
      '创建房间，用 4 位房间号邀请朋友加入；每轮支出实时同步，结束时自动算出最少转账方案。适合麻将、扑克、桌游和各种朋友局。',
    proof: ['无需注册', '2-8 人房间', '实时同步', '无广告'],
    primaryCta: '开始记账',
    secondaryCta: '查看功能',
    navFeatures: '功能',
    navUseCases: '场景',
    navFaq: 'FAQ',
    languageLabel: '语言',
    joinLabel: '已有房间号？',
    joinPlaceholder: '1234',
    joinButton: '加入房间',
    joinError: '请输入 4 位数字房间号。',
    preview: {
      roomCodeLabel: '房间号',
      roomCode: '4826',
      live: '实时同步',
      round: '第 6 轮',
      tableTitle: '本局战绩',
      settlementTitle: '自动结算',
      settlementHint: '自动生成最少转账方案',
      transfer: '阿南 转给 小林 24',
      players: [
        { emoji: '🀄', name: '小林', amount: '+86', tone: 'positive' },
        { emoji: '♠️', name: '阿南', amount: '-42', tone: 'negative' },
        { emoji: '🎲', name: '可乐', amount: '+18', tone: 'positive' },
        { emoji: '♦️', name: '小雨', amount: '-62', tone: 'negative' },
      ],
      rounds: [
        { label: '4', east: '+18', south: '-12', west: '+6', north: '-12' },
        { label: '5', east: '+32', south: '-18', west: '0', north: '-14' },
        { label: '6', east: '+36', south: '-12', west: '+12', north: '-36' },
      ],
    },
    metrics: [
      { value: '4 位', label: '房间号' },
      { value: '实时', label: '多人同步' },
      { value: '一键', label: '结算方案' },
    ],
    featuresTitle: '为牌桌设计，不是表格替代品',
    featuresLead:
      '页面围绕真实朋友局流程组织：开房、邀请、记每轮、看战绩、最后结算。',
    features: [
      {
        title: '创建房间',
        body: '开局前快速创建临时房间，不需要让每个人注册账号。',
        marker: '01',
      },
      {
        title: '房间号加入',
        body: '分享 4 位房间号、链接或二维码，朋友用手机浏览器就能加入。',
        marker: '02',
      },
      {
        title: '轮次记录',
        body: '按轮次保存支出和输赢变化，复盘时不会变成一长串混乱流水。',
        marker: '03',
      },
      {
        title: '实时同步',
        body: '玩家、支出、倒计时和房间状态会同步更新，桌上每个人都能看到。',
        marker: '04',
      },
      {
        title: '自动结算',
        body: '结束后根据余额生成最少转账方案，减少反复心算和对账。',
        marker: '05',
      },
      {
        title: '历史记录',
        body: '结算后的房间会保存战绩快照，包含个人胜率、总盈亏和玩家结果。',
        marker: '06',
      },
    ],
    useCasesTitle: '一套记账，覆盖各种朋友局',
    useCasesLead:
      '只要需要多人共享记分、转账或结算，就可以用一个轻量房间替代纸笔和心算。',
    useCases: [
      {
        name: '麻将',
        body: '适合 4 人麻将，按轮记录输赢，最后自动算清转账。',
      },
      {
        name: '扑克',
        body: '记录买入、支出或分数变化，不靠筹码也能清楚对账。',
      },
      {
        name: '桌游',
        body: '适合分数、惩罚或支付会在玩家之间转移的桌游。',
      },
      {
        name: '共享记分',
        body: '聚会游戏、饭局小游戏、临时朋友局都能快速开房记录。',
      },
    ],
    faqTitle: '常见问题',
    faqLead: '给玩家、搜索引擎和 AI 摘要都能直接理解的简短答案。',
    faq: [
      {
        question: '玩家需要注册吗？',
        answer:
          '不需要。打牌记账使用匿名登录，玩家可以直接创建或加入房间。',
      },
      {
        question: '房间号怎么用？',
        answer:
          '每个房间都有 4 位数字房间号，房主可以分享房间号、链接或二维码给其他玩家。',
      },
      {
        question: '结算逻辑是什么？',
        answer:
          '系统会根据记录的支出计算每个玩家余额，然后生成最少转账方案，让房间可以快速结清。',
      },
      {
        question: '历史记录会保存吗？',
        answer:
          '房间确认结算后，会保存一份结算快照，包含玩家结果和个人统计。',
      },
      {
        question: '手机上能用吗？',
        answer:
          '可以。打牌记账是移动端优先的网页应用，不需要下载安装 app。',
      },
    ],
    finalCtaTitle: '第一轮开始前，先开一个干净的记账房间',
    finalCtaBody: '创建房间、分享房间号，让所有人实时看到分数变化。',
    schemaApplicationName: '打牌记账',
    schemaAlternateName: 'Game Ledger',
    schemaCategory: 'GameApplication',
  },
}

export function isHeroLocale(value: string): value is HeroLocale {
  return value === 'en' || value === 'zh'
}

export function detectHeroLocaleFromAcceptLanguage(acceptLanguage: string | null) {
  if (!acceptLanguage) return 'en' satisfies HeroLocale

  const languages = acceptLanguage
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return languages.some((language) => language.startsWith('zh')) ? 'zh' : 'en'
}

export function getHeroCanonicalPath(locale: HeroLocale | 'adaptive') {
  if (locale === 'adaptive') return '/hero'
  return `/hero/${locale}`
}

export function getHeroAlternates() {
  return {
    en: '/hero/en',
    'zh-CN': '/hero/zh',
    'x-default': '/hero/en',
  }
}

export function createHeroMetadata(locale: HeroLocale, canonicalPath: string): Metadata {
  const content = heroContent[locale]
  const imageUrl = getOgImageUrl(locale)

  return {
    metadataBase: new URL(getSiteUrl()),
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    alternates: {
      canonical: canonicalPath,
      languages: getHeroAlternates(),
    },
    robots: publicRobots,
    openGraph: {
      type: 'website',
      url: getAbsoluteUrl(canonicalPath),
      siteName: SITE_BRAND,
      title: content.metaTitle,
      description: content.metaDescription,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: content.metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: [imageUrl],
    },
  }
}

export function createHeroJsonLd(locale: HeroLocale, canonicalPath: string) {
  const content = heroContent[locale]
  const canonicalUrl = getAbsoluteUrl(canonicalPath)
  const rootUrl = getAbsoluteUrl('/')
  const imageUrl = getOgImageUrl(locale)
  const applicationId = `${canonicalUrl}#software`
  const faqId = `${canonicalUrl}#faq`
  const webPageId = `${canonicalUrl}#webpage`
  const websiteId = `${rootUrl}#website`
  const brandId = `${rootUrl}#brand`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': applicationId,
        name: content.schemaApplicationName,
        alternateName: content.schemaAlternateName,
        applicationCategory: content.schemaCategory,
        operatingSystem: 'Web',
        url: canonicalUrl,
        inLanguage: content.schemaLanguage,
        description: content.metaDescription,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: content.features.map((feature) => feature.title),
        keywords: content.keywords.join(', '),
        image: imageUrl,
        screenshot: imageUrl,
        browserRequirements:
          'Requires a modern web browser with JavaScript enabled for room creation and live sync.',
        audience: {
          '@type': 'Audience',
          audienceType:
            locale === 'zh'
              ? '麻将、扑克、桌游和朋友局玩家'
              : 'Mahjong, poker, board game, and game night players',
        },
        brand: {
          '@id': brandId,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': faqId,
        inLanguage: content.schemaLanguage,
        mainEntity: content.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': webPageId,
        url: canonicalUrl,
        name: content.metaTitle,
        description: content.metaDescription,
        inLanguage: content.schemaLanguage,
        isPartOf: {
          '@id': websiteId,
        },
        about: {
          '@id': applicationId,
        },
        mainEntity: [
          {
            '@id': applicationId,
          },
          {
            '@id': faqId,
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: rootUrl,
        name: SITE_BRAND,
        alternateName: ['打牌记账', 'Game Ledger', 'Jizhang'],
        description:
          'A bilingual web app for real-time game score tracking and automatic settlement.',
        inLanguage: ['zh-CN', 'en-US'],
        about: {
          '@id': applicationId,
        },
        publisher: {
          '@id': brandId,
        },
      },
      {
        '@type': 'Brand',
        '@id': brandId,
        name: SITE_BRAND,
        alternateName: ['打牌记账', 'Game Ledger', 'Jizhang'],
        url: rootUrl,
      },
    ],
  }
}
