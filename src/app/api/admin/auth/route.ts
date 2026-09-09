import { NextResponse } from 'next/server';
import {
  verifyPassword,
  generateSessionToken,
  isAuthenticatedAdmin,
  ADMIN_COOKIE_NAME,
} from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

/**
 * Check authentication status.
 */
export async function GET(request: Request) {
  const authenticated = await isAuthenticatedAdmin(request);
  return NextResponse.json({
    success: true,
    authenticated,
    user: authenticated
      ? {
          username: "admin",
          role: "Super Administrator",
          name: "MintFolio Master",
        }
      : null,
  });
}

/**
 * Login with admin credentials.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (username && typeof username === 'string' && username.trim().toLowerCase() !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama pengguna admin tidak ditemukan.',
        },
        { status: 401 }
      );
    }

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kata sandi admin tidak sesuai. Silakan coba lagi.',
        },
        { status: 401 }
      );
    }

    const token = generateSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil.',
      token,
      user: {
        username: 'admin',
        role: 'Super Administrator',
        name: 'MintFolio Master',
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan pada proses login admin',
      },
      { status: 500 }
    );
  }
}

/**
 * Logout and clear session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi admin berhasil diakhiri.',
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
