import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth endpoints and pages
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/logout' ||
    pathname === '/api/admin/auth' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    return NextResponse.next();
  }

  // Check for admin session cookie or Authorization header
  let token = request.cookies.get('mintfolio_admin_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  const isApiRoute = pathname.startsWith('/api/admin');

  // If no token exists
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Token autentikasi admin tidak ditemukan.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token timestamp structure (24 hours validity)
  const parts = token.split('.');
  if (parts.length !== 2) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Format token autentikasi admin tidak valid.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    if (isApiRoute) {
      const response = NextResponse.json(
        { success: false, error: 'Sesi admin telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
      response.cookies.delete('mintfolio_admin_token');
      return response;
    }
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('mintfolio_admin_token');
    return response;
  }

  return NextResponse.next();
}
