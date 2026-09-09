import { NextResponse } from 'next/server';
import {
  verifyPasswordAsync,
  isValidAdminUsername,
  generateSessionToken,
  isAuthenticatedAdmin,
  ADMIN_COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL,
} from '@/lib/server/auth';
import { getDatabase, saveDatabase } from '@/lib/server/db';

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
          username: "elmurtadho",
          email: DEFAULT_ADMIN_EMAIL,
          role: "Super Administrator",
          name: "Ahmad Elmurtadho",
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

    if (username && !isValidAdminUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama pengguna atau email admin tidak ditemukan.',
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPasswordAsync(password);
    if (!password || !isPasswordValid) {
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
        username: username || 'elmurtadho',
        email: DEFAULT_ADMIN_EMAIL,
        role: 'Super Administrator',
        name: 'Ahmad Elmurtadho',
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
 * Update admin password.
 */
export async function PUT(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin(request);
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Akses tidak sah. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body || {};

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi baru minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    const isCurrentValid = await verifyPasswordAsync(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi saat ini tidak sesuai.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db.settings) {
      db.settings = {
        siteTitle: 'ElmurtadhosPortfolio',
        adminEmail: DEFAULT_ADMIN_EMAIL,
        theme: 'dark-mint',
        maintenanceMode: false,
        updatedAt: new Date().toISOString(),
      };
    }

    (db.settings as any).adminPassword = newPassword;
    db.settings.updatedAt = new Date().toISOString();
    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Kata sandi admin berhasil diperbarui!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengubah kata sandi admin' },
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
