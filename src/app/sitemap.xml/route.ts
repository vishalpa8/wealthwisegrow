import { NextResponse } from 'next/server';
import { generateSitemap, siteUrls } from '@/lib/seo/sitemap';

export async function GET() {
  const sitemap = generateSitemap(siteUrls);
  
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}