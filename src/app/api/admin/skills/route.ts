import { NextResponse } from 'next/server';
import { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateSkill } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await getSkills();
    const sorted = [...skills].sort((a, b) => (a.order || 0) - (b.order || 0));
    return NextResponse.json({ success: true, data: sorted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data keahlian' },
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
    const validation = validateSkill(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, level, category, icon, order } = body;
    if (!name || level === undefined || !category) {
      return NextResponse.json(
        { success: false, error: 'Nama, level, dan kategori keahlian wajib diisi' },
        { status: 400 }
      );
    }

    const created = await createSkill({
      name: String(name).trim(),
      level: Number(level),
      category: String(category).trim(),
      icon: icon ? String(icon).trim() : undefined,
      order: order !== undefined ? Number(order) : undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Keahlian berhasil ditambahkan', data: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan keahlian' },
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

    // Check for batch reorder action
    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      const reordered = await reorderSkills(body.orderedIds.map(Number));
      return NextResponse.json({
        success: true,
        message: 'Urutan keahlian berhasil diperbarui',
        data: reordered,
      });
    }

    const id = Number(body.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID keahlian wajib disertakan' },
        { status: 400 }
      );
    }

    const validation = validateSkill(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateSkill(id, validation.data || {});
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Keahlian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Keahlian berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui keahlian' },
      { status: 500 }
    );
  }
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

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    let id = idParam ? Number(idParam) : null;

    if (!id) {
      try {
        const body = await request.json();
        id = Number(body.id);
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID keahlian wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteSkill(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Keahlian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Keahlian berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus keahlian' },
      { status: 500 }
    );
  }
}
