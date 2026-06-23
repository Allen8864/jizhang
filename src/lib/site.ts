export const SITE_BRAND = 'Jizhang / Game Ledger'
export const SITE_SHORT_NAME = 'Jizhang'
export const SITE_DEFAULT_TITLE = '打牌记账 - 麻将扑克实时记分和自动结算工具'
export const SITE_DESCRIPTION =
  '免费在线打牌记账工具，适合麻将、扑克、桌游和朋友局。创建房间、房间号加入、轮次记录、多人实时同步、自动结算。'

export const SITE_KEYWORDS = [
  '打牌记账',
  '麻将记分器',
  '扑克结算工具',
  '游戏记账',
  '自动结算',
  '房间号记账',
  'game ledger',
  'mahjong score tracker',
  'poker settlement app',
  'game night score tracker',
]

const PRODUCTION_SITE_URL = 'https://jizhang.s-yc.com'

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, '')
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) return normalizeSiteUrl(configuredUrl)

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  return PRODUCTION_SITE_URL
}

export function getAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}

export function getOgImageUrl(locale: 'en' | 'zh' = 'zh') {
  return getAbsoluteUrl(`/hero/og?lang=${locale}`)
}
