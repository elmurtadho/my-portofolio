import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { saveTursoChunk, assembleTursoChunks, isTursoEnabled } from '@/lib/server/turso';
import { detectMediaType } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB for video
const MAX_GENERAL_SIZE = 100 * 1024 * 1024; // 100MB for 3D/others

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    if (!isTursoEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Database Turso belum terhubung untuk chunked upload.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const uploadId = formData.get('uploadId') as string;
    const chunkIndex = Number(formData.get('chunkIndex'));
    const totalChunks = Number(formData.get('totalChunks'));
    const filename = (formData.get('filename') as string) || 'upload.mp4';
    const totalFileSize = Number(formData.get('totalFileSize') || 0);
    const mimeTypeParam = (formData.get('mimeType') as string) || '';

    if (!(file instanceof File) || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json(
        { success: false, error: 'Parameter chunk tidak lengkap.' },
        { status: 400 }
      );
    }

    const mediaType = detectMediaType(filename, file.type || mimeTypeParam);
    const maxAllowed = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_GENERAL_SIZE;

    if (totalFileSize > maxAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran berkas "${filename}" melebihi batas kapasitas maksimal ${maxAllowed / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save this chunk into Turso SQLite
    await saveTursoChunk(uploadId, chunkIndex, buffer);

    // If this is the last chunk, assemble into portfolio_media
    if (chunkIndex === totalChunks - 1) {
      const mimeType = mimeTypeParam || file.type || (mediaType === 'video' ? 'video/mp4' : 'application/octet-stream');
      const assembled = await assembleTursoChunks(uploadId, filename, mimeType);

      return NextResponse.json({
        success: true,
        completed: true,
        message: 'Seluruh chunk berkas berhasil dirakit dan disimpan ke database!',
        data: {
          ...assembled,
          mediaType,
          originalName: filename,
        },
      });
    }

    return NextResponse.json({
      success: true,
      completed: false,
      chunkIndex,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} berhasil diterima`,
    });
  } catch (error: any) {
    console.error('[chunked-upload] Error processing chunk:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses potongan berkas' },
      { status: 500 }
    );
  }
}
