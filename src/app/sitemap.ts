import type { MetadataRoute } from 'next'
import { getAbsoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: getAbsoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl('/hero/en'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: getAbsoluteUrl('/hero/en'),
          'zh-CN': getAbsoluteUrl('/hero/zh'),
          'x-default': getAbsoluteUrl('/hero'),
        },
      },
    },
    {
      url: getAbsoluteUrl('/hero/zh'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: getAbsoluteUrl('/hero/en'),
          'zh-CN': getAbsoluteUrl('/hero/zh'),
          'x-default': getAbsoluteUrl('/hero'),
        },
      },
    },
  ]
}
