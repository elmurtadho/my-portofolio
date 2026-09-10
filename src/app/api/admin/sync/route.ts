import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, setFullDatabase } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sync
 * Return entire database schema to authorized admin.
 */
export async function GET(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    return NextResponse.json({
      success: true,
      message: 'Data database berhasil disinkronisasi',
      data: db,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyinkronkan database' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sync
 * Merge client-provided updates into server database and persist.
 */
export async function POST(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Format data sinkronisasi tidak valid' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    // If full database is sent
    if (body.fullDb && typeof body.fullDb === 'object') {
      const updated = await setFullDatabase(body.fullDb);
      return NextResponse.json({
        success: true,
        message: 'Seluruh database berhasil disinkronkan',
        data: updated,
      });
    }

    // Merge individual sections if provided
    if (Array.isArray(body.skills)) {
      db.skills = body.skills;
    }
    if (Array.isArray(body.projects)) {
      db.projects = body.projects;
    }
    if (Array.isArray(body.categories)) {
      db.categories = body.categories;
    }
    if (body.profile && typeof body.profile === 'object') {
      db.profile = { ...db.profile, ...body.profile, updatedAt: now };
    }
    if (body.about && typeof body.about === 'object') {
      db.about = { ...db.about, ...body.about, updatedAt: now };
    }
    if (body.contact && typeof body.contact === 'object') {
      db.contact = { ...db.contact, ...body.contact, updatedAt: now };
    }
    if (body.settings && typeof body.settings === 'object') {
      db.settings = { ...db.settings, ...body.settings, updatedAt: now };
    }

    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Perubahan berhasil disinkronkan ke database server',
      data: db,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyimpan sinkronisasi database' },
      { status: 500 }
    );
  }
}
