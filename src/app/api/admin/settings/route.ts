import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, getAdminSettings, updateAdminSettings } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { runMigrations, getInitialSeedData, CURRENT_SCHEMA_VERSION } from '@/lib/server/migrations';

export const dynamic = 'force-dynamic';

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
    const settings = await getAdminSettings();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        schema: {
          currentVersion: CURRENT_SCHEMA_VERSION,
          databaseVersion: db.version,
          migratedAt: db.migratedAt,
        },
        counts: {
          skills: db.skills?.length || 0,
          categories: db.categories?.length || 0,
          projects: db.projects?.length || 0,
          inquiries: db.inquiries?.length || 0,
          unreadInquiries: (db.inquiries || []).filter((i) => !i.read).length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat pengaturan sistem' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updated = await updateAdminSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan admin berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui pengaturan' },
      { status: 500 }
    );
  }
}

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

    // Trigger migration
    if (body.action === 'migrate') {
      const db = await getDatabase();
      const migrated = runMigrations(db);
      await saveDatabase(migrated);
      return NextResponse.json({
        success: true,
        message: 'Migrasi database berhasil dijalankan.',
        data: { version: migrated.version, migratedAt: migrated.migratedAt },
      });
    }

    // Trigger full reset to seed
    if (body.action === 'reset_seed') {
      const seed = getInitialSeedData();
      await saveDatabase(seed);
      return NextResponse.json({
        success: true,
        message: 'Database berhasil direset ke data awal (seeder).',
        data: seed,
      });
    }

    return PUT(request);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menjalankan aksi sistem' },
      { status: 500 }
    );
  }
}
