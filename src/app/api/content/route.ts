import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const limitProjects = searchParams.get('limitProjects');

    const db = await getDatabase();

    // Sort items by order ascending
    const sortedSkills = [...db.skills].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sortedCategories = [...db.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    let sortedProjects = [...db.projects].sort((a, b) => (a.order || 0) - (b.order || 0));

    if (limitProjects) {
      const limit = Number(limitProjects);
      if (!isNaN(limit) && limit > 0) {
        sortedProjects = sortedProjects.slice(0, limit);
      }
    }

    // Determine the latest updated timestamp across all database sections
    const updateDates = [
      db.profile?.updatedAt,
      db.about?.updatedAt,
      db.contact?.updatedAt,
      ...db.skills.map((s) => s.updatedAt),
      ...db.categories.map((c) => c.updatedAt),
      ...db.projects.map((p) => p.updatedAt),
    ].filter(Boolean);

    const latestUpdatedAt = updateDates.length > 0
      ? updateDates.sort().reverse()[0]
      : new Date().toISOString();

    const allData = {
      profile: db.profile,
      about: db.about,
      skills: sortedSkills,
      categories: sortedCategories,
      projects: sortedProjects,
      contact: db.contact,
    };

    if (section && section in allData) {
      return NextResponse.json(
        {
          success: true,
          section,
          data: (allData as any)[section],
          meta: {
            latestUpdatedAt,
            schemaVersion: db.version,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: allData,
        meta: {
          schemaVersion: db.version,
          totalProjects: db.projects.length,
          totalSkills: db.skills.length,
          totalCategories: db.categories.length,
          latestUpdatedAt,
          retrievedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal mengambil seluruh data konten portofolio terbaru',
      },
      { status: 500 }
    );
  }
}

