import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();

    return NextResponse.json({
      success: true,
      data: {
        profile: db.profile,
        about: db.about,
        skills: db.skills,
        categories: db.categories,
        projects: db.projects,
        contact: db.contact,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal mengambil data konten portofolio',
      },
      { status: 500 }
    );
  }
}
