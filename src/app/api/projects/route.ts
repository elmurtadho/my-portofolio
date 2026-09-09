import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    let projects = await getProjects();

    if (category && category !== 'all') {
      projects = projects.filter((p) => p.categorySlug === category);
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data karya/proyek' },
      { status: 500 }
    );
  }
}
