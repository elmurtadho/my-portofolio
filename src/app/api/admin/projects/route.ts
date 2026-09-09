import { NextResponse } from 'next/server';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getCategories,
  reorderProjects,
} from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateProject } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const mediaType = searchParams.get('mediaType');
    const featured = searchParams.get('featured');
    const query = searchParams.get('q') || searchParams.get('search');

    let projects = await getProjects();

    // Sort by order ascending
    projects.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (category && category !== 'all') {
      projects = projects.filter(
        (p) => p.categorySlug.toLowerCase() === category.toLowerCase()
      );
    }

    if (mediaType && mediaType !== 'all') {
      projects = projects.filter((p) => p.mediaType === mediaType);
    }

    if (featured !== null && featured !== undefined && featured !== '') {
      const isFeatured = featured === 'true' || featured === '1';
      projects = projects.filter((p) => Boolean(p.featured) === isFeatured);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, count: projects.length, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data proyek' },
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
    const validation = validateProject(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      categorySlug,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      featured,
      tags,
      order,
    } = body;

    if (!title || !categorySlug || !mediaType) {
      return NextResponse.json(
        { success: false, error: 'Judul, kategori, dan tipe media wajib diisi' },
        { status: 400 }
      );
    }

    // Verify category existence
    const categories = await getCategories();
    const cleanCategorySlug = String(categorySlug).trim().toLowerCase();
    const categoryExists = categories.some(
      (c) => c.slug.toLowerCase() === cleanCategorySlug
    );

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori '${categorySlug}' tidak ditemukan. Pilih kategori yang terdaftar atau buat kategori baru terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    const created = await createProject({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      categorySlug: cleanCategorySlug,
      mediaType: mediaType,
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : '',
      thumbnailUrl: thumbnailUrl ? String(thumbnailUrl).trim() : (mediaUrl || ''),
      featured: Boolean(featured),
      tags: Array.isArray(tags) ? tags.map(String) : [],
      order: order !== undefined ? Number(order) : undefined,
    });

    return NextResponse.json(
      { success: true, message: 'Proyek berhasil ditambahkan', data: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan proyek' },
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
        { success: false, error: 'ID proyek wajib disertakan' },
        { status: 400 }
      );
    }

    const validation = validateProject(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    if (body.categorySlug) {
      const categories = await getCategories();
      const cleanCategorySlug = String(body.categorySlug).trim().toLowerCase();
      const categoryExists = categories.some(
        (c) => c.slug.toLowerCase() === cleanCategorySlug
      );
      if (!categoryExists) {
        return NextResponse.json(
          {
            success: false,
            error: `Kategori '${body.categorySlug}' tidak ditemukan.`,
          },
          { status: 400 }
        );
      }
      if (validation.data) {
        validation.data.categorySlug = cleanCategorySlug;
      }
    }

    const updated = await updateProject(id, validation.data || {});
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

export async function PATCH(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Support batch reordering: { orders: [{ id: 1, order: 0 }, { id: 2, order: 1 }] }
    if (Array.isArray(body.orders)) {
      const updatedList = await reorderProjects(body.orders);
      return NextResponse.json({
        success: true,
        message: 'Urutan proyek berhasil diperbarui',
        data: updatedList,
      });
    }

    // Support single project partial update: { id: 1, featured: true }
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID proyek atau daftar orders wajib disertakan' },
        { status: 400 }
      );
    }

    if (body.categorySlug) {
      const categories = await getCategories();
      const cleanCategorySlug = String(body.categorySlug).trim().toLowerCase();
      const categoryExists = categories.some(
        (c) => c.slug.toLowerCase() === cleanCategorySlug
      );
      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: `Kategori '${body.categorySlug}' tidak ditemukan.` },
          { status: 400 }
        );
      }
      body.categorySlug = cleanCategorySlug;
    }

    const updated = await updateProject(id, body);
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
        { success: false, error: 'ID proyek wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteProject(id);
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

