import { NextResponse } from 'next/server';
import { getProjects, updateProject, deleteProject, getCategories } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateProject } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    const projects = await getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data proyek' },
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
    const projectId = Number(id);
    const body = await request.json();

    const validation = validateProject(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    if (body.categorySlug) {
      const categories = await getCategories();
      const cleanSlug = String(body.categorySlug).trim().toLowerCase();
      const exists = categories.some((c) => c.slug.toLowerCase() === cleanSlug);
      if (!exists) {
        return NextResponse.json(
          { success: false, error: `Kategori '${body.categorySlug}' tidak ditemukan.` },
          { status: 400 }
        );
      }
      if (validation.data) {
        validation.data.categorySlug = cleanSlug;
      }
    }

    const updated = await updateProject(projectId, validation.data || {});
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui proyek' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const projectId = Number(id);
    const body = await request.json();

    if (body.categorySlug) {
      const categories = await getCategories();
      const cleanSlug = String(body.categorySlug).trim().toLowerCase();
      const exists = categories.some((c) => c.slug.toLowerCase() === cleanSlug);
      if (!exists) {
        return NextResponse.json(
          { success: false, error: `Kategori '${body.categorySlug}' tidak ditemukan.` },
          { status: 400 }
        );
      }
      body.categorySlug = cleanSlug;
    }

    const updated = await updateProject(projectId, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui proyek' },
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
    const projectId = Number(id);
    const success = await deleteProject(projectId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proyek berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus proyek' },
      { status: 500 }
    );
  }
}

