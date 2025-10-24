/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Generates robots.txt for search engine crawlers
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-comparison-showcase.vercel.app';
  
  const robotsTxt = `# AI Comparison Showcase
# https://github.com/yourusername/ai-comparison-showcase

User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}