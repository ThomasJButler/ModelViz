/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Generates XML sitemap for search engine indexing
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://modelviz.vercel.app';

  const pages = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/playground', changefreq: 'weekly', priority: 0.9 },
    { loc: '/models', changefreq: 'weekly', priority: 0.8 },
    { loc: '/analytics', changefreq: 'weekly', priority: 0.7 },
    { loc: '/dashboard', changefreq: 'weekly', priority: 0.7 },
    { loc: '/model-builder', changefreq: 'monthly', priority: 0.6 },
    { loc: '/docs', changefreq: 'monthly', priority: 0.5 },
    { loc: '/profile', changefreq: 'monthly', priority: 0.4 }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}