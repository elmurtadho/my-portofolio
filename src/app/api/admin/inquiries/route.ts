import { NextResponse } from 'next/server';
import { getInquiries, markInquiryRead, deleteInquiry } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data pesan' },
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
    const { id, read } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesan wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await markInquiryRead(String(id), read !== false);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Pesan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status pesan berhasil diperbarui',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui status pesan' },
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
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesan wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteInquiry(String(id));
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Pesan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus pesan' },
      { status: 500 }
    );
  }
}
