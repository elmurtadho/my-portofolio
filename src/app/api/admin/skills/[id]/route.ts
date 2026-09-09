import { NextResponse } from 'next/server';
import { getSkills, updateSkill, deleteSkill } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateSkill } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skillId = Number(id);
    const skills = await getSkills();
    const skill = skills.find((s) => s.id === skillId);

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Keahlian tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: skill });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data keahlian' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const skillId = Number(id);
    const body = await request.json();

    const validation = validateSkill(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const payload = { ...(validation.data || {}) };
    if (body.level !== undefined) {
      payload.level = Math.min(100, Math.max(0, Number(body.level)));
    }

    const updated = await updateSkill(skillId, payload);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const skillId = Number(id);
    const success = await deleteSkill(skillId);

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
