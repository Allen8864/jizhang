import type { MetadataRoute } from 'next'
import { getAbsoluteUrl, getSiteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ['/api/', '/history', '/room/']

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/hero/', '/manifest.json', '/icons/', '/llms.txt'],
        disallow: privatePaths,
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/hero/', '/llms.txt'],
        disallow: privatePaths,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/hero/', '/llms.txt'],
        disallow: privatePaths,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/hero/', '/llms.txt'],
        disallow: privatePaths,
      },
    ],
    sitemap: getAbsoluteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  }
}
