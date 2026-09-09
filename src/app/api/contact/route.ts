import { NextResponse } from 'next/server';
import { getContact, createInquiry } from '@/lib/server/db';
import { validateInquiry } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await getContact();
    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data kontak' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateInquiry(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry(validation.data);
    return NextResponse.json(
      {
        success: true,
        message: 'Pesan Anda berhasil dikirimkan. Terima kasih!',
        data: { id: inquiry.id },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengirimkan pesan' },
      { status: 500 }
    );
  }
}
