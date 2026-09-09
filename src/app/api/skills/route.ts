import { NextResponse } from 'next/server';
import { getSkills } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await getSkills();
    return NextResponse.json({
      success: true,
      data: skills,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data keahlian' },
      { status: 500 }
    );
  }
}
