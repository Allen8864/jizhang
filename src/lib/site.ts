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
