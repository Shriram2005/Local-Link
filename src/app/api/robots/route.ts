import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://locallink.vercel.app';
  
  const robots = `User-agent: *
Allow: /
Allow: /auth/login
Allow: /auth/register
Allow: /dashboard/search

Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/forgot-password

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
