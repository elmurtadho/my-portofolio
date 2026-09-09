import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  }
}
