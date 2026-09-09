import { NextResponse } from 'next/server';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateCategory } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data kategori' },
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
    const validation = validateCategory(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, slug, description, icon, order } = body;
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Nama dan slug kategori wajib diisi' },
        { status: 400 }
      );
    }

    const created = await createCategory({
      name: String(name).trim(),
      slug: String(slug).trim().toLowerCase(),
      description: description ? String(description).trim() : undefined,
      icon: icon ? String(icon).trim() : undefined,
      order: order !== undefined ? Number(order) : undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Kategori berhasil ditambahkan', data: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan kategori' },
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
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kategori wajib disertakan' },
        { status: 400 }
      );
    }

    const validation = validateCategory(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, validation.data || {});
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
        { success: false, error: 'ID kategori wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteCategory(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
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
