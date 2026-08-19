import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEV_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.vercel\.app$/,
];

// The external admin dashboard's origin varies per deployment, so it's configured
// via env (ADMIN_DASHBOARD_ORIGIN, comma-separated) instead of hardcoded here.
const EXTRA_ALLOWED_ORIGINS = (process.env.ADMIN_DASHBOARD_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (EXTRA_ALLOWED_ORIGINS.includes(origin)) return true;
  return DEV_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigin = isOriginAllowed(origin) ? origin : '';

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
  };
  if (allowedOrigin) corsHeaders['Access-Control-Allow-Origin'] = allowedOrigin;

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
