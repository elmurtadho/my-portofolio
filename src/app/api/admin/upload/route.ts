import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { saveUploadedFile, listUploadedFiles, deleteUploadedFile } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let files = await listUploadedFiles();
    if (type && ['image', 'video', 'model3d'].includes(type)) {
      files = files.filter((f) => f.mediaType === type);
    }

    return NextResponse.json({ success: true, data: files });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat daftar media' },
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

    const formData = await request.formData();
    const rawFiles = formData.getAll('file');
    const filesToUpload: File[] = (
      rawFiles.length > 0 ? rawFiles : formData.getAll('files')
    ).filter((item): item is File => item instanceof File);

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada berkas yang dipilih untuk diunggah' },
        { status: 400 }
      );
    }

    const savedResults = [];
    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `Berkas "${file.name}" melebihi batas ukuran maksimal 60MB`,
          },
          { status: 400 }
        );
      }
      const stored = await saveUploadedFile(file);
      savedResults.push(stored);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          savedResults.length === 1
            ? 'Berkas media berhasil diunggah'
            : `${savedResults.length} berkas media berhasil diunggah`,
        data: savedResults[0],
        files: savedResults,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengunggah media' },
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
    let filename = searchParams.get('filename');

    if (!filename) {
      try {
        const body = await request.json();
        filename = body.filename;
      } catch {
        // no body
      }
    }

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Nama file wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteUploadedFile(filename);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Media berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus media' },
      { status: 500 }
    );
  }
}
