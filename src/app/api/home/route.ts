import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/**
 * Public endpoint serving complete homepage data for all sections.
 */
export async function GET() {
  try {
    const db = await getDatabase();

    return NextResponse.json(
      {
        success: true,
        data: {
          profile: db.profile,
          about: db.about,
          skills: db.skills,
          categories: db.categories,
          projects: db.projects,
          contact: db.contact,
        },
        meta: {
          schemaVersion: db.version,
          totalProjects: db.projects.length,
          totalSkills: db.skills.length,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal memuat data publik beranda',
      },
      { status: 500 }
    );
  }
}
