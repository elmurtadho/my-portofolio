import { NextResponse } from 'next/server';
import { getAbout, updateAbout } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateAbout } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const about = await getAbout();
    return NextResponse.json({ success: true, data: about });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data tentang saya' },
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
    const validation = validateAbout(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateAbout(validation.data || {});
    return NextResponse.json({
      success: true,
      message: 'Data tentang saya berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui data tentang saya' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return PUT(request);
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const { getInitialSeedData } = await import('@/lib/server/migrations');
    const initial = getInitialSeedData();
    const updated = await updateAbout(initial.about);

    return NextResponse.json({
      success: true,
      message: 'Data tentang saya berhasil direset ke pengaturan awal',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mereset data tentang saya' },
      { status: 500 }
    );
  }
}
