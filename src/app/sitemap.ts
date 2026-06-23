import type { MetadataRoute } from 'next'
import { getAbsoluteUrl, getOgImageUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const zhImage = getOgImageUrl('zh')
  const enImage = getOgImageUrl('en')

  return [
    {
      url: getAbsoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [zhImage],
    },
    {
      url: getAbsoluteUrl('/hero/en'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      images: [enImage],
      alternates: {
        languages: {
          en: getAbsoluteUrl('/hero/en'),
          'zh-CN': getAbsoluteUrl('/hero/zh'),
          'x-default': getAbsoluteUrl('/hero/en'),
        },
      },
    },
    {
      url: getAbsoluteUrl('/hero/zh'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      images: [zhImage],
      alternates: {
        languages: {
          en: getAbsoluteUrl('/hero/en'),
          'zh-CN': getAbsoluteUrl('/hero/zh'),
          'x-default': getAbsoluteUrl('/hero/en'),
        },
      },
    },
  ]
}
