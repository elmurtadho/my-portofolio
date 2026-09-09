import { NextResponse } from 'next/server';
import { getCategories, updateCategory, deleteCategory, getProjects } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateCategory } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = Number(id);
    const categories = await getCategories();
    const category = categories.find((c) => c.id === catId);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data kategori' },
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
    const catId = Number(id);
    const body = await request.json();

    const validation = validateCategory(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateCategory(catId, validation.data || {});
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui kategori' },
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
    const catId = Number(id);

    const categories = await getCategories();
    const category = categories.find((c) => c.id === catId);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const projects = await getProjects();
    const linkedCount = projects.filter((p) => p.categorySlug === category.slug).length;
    if (linkedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori "${category.name}" masih digunakan oleh ${linkedCount} karya. Pindahkan atau hapus karya tersebut sebelum menghapus kategori.`,
        },
        { status: 400 }
      );
    }

    const success = await deleteCategory(catId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Gagal menghapus kategori' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}
