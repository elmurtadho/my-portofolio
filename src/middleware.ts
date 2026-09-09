import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/selfcrudcontent'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Secret portal is public for login
  if (pathname === '/selfcrudcontent') {
    return NextResponse.next();
  }

  // Hide generic /admin/login by redirecting to /selfcrudcontent
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/selfcrudcontent', request.url));
  }

  // Allow public auth endpoints and logout
  if (
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
    const loginUrl = new URL('/selfcrudcontent', request.url);
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
    return NextResponse.redirect(new URL('/selfcrudcontent', request.url));
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
    const response = NextResponse.redirect(new URL('/selfcrudcontent', request.url));
    response.cookies.delete('mintfolio_admin_token');
    return response;
  }

  return NextResponse.next();
}
