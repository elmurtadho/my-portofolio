import { NextResponse } from 'next/server';
import { getTursoMedia, isTursoEnabled } from '@/lib/server/turso';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID media tidak valid' }, { status: 400 });
    }

    if (!isTursoEnabled()) {
      return NextResponse.json({ error: 'Database media cloud tidak tersedia' }, { status: 404 });
    }

    const media = await getTursoMedia(id);
    if (!media) {
      return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 });
    }

    return new Response(media.data as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'application/octet-stream',
        'Content-Length': media.data.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${media.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[media] Error serving media file:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memuat berkas media' },
      { status: 500 }
    );
  }
}
