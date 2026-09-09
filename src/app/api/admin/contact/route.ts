import { NextResponse } from 'next/server';
import { getContact, updateContact } from '@/lib/server/db';
import { isAuthenticatedAdmin } from '@/lib/server/auth';
import { validateContact } from '@/lib/server/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await getContact();
    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal mengambil data kontak' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAuthenticatedAdmin(request);
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login sebagai admin.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateContact(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const updated = await updateContact(validation.data || {});
    return NextResponse.json({
      success: true,
      message: 'Data kontak berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui kontak' },
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

    const body = await request.clone().json();

    // If payload targets a specific social link directly
    if (body.platform && body.url && !body.email && !body.phone) {
      const contact = await getContact();
      const existingIdx = contact.socials.findIndex(
        (s) => s.platform.toLowerCase() === body.platform.trim().toLowerCase()
      );
      let newSocials = [...contact.socials];
      if (existingIdx >= 0) {
        newSocials[existingIdx] = { platform: body.platform.trim(), url: body.url.trim() };
      } else {
        newSocials.push({ platform: body.platform.trim(), url: body.url.trim() });
      }

      const updated = await updateContact({ socials: newSocials });
      return NextResponse.json({
        success: true,
        message: `Tautan sosial "${body.platform}" berhasil disimpan`,
        data: updated,
      });
    }

    return PUT(request);
  } catch (error: any) {
    return PUT(request);
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
    const contact = await getContact();

    // Partial updates supported: email, phone, location, socials, directMessageTitle, directMessageSubtitle
    const updates: any = {};
    if (body.email !== undefined) updates.email = String(body.email).trim();
    if (body.phone !== undefined) updates.phone = String(body.phone).trim();
    if (body.location !== undefined) updates.location = String(body.location).trim();
    if (Array.isArray(body.socials)) {
      updates.socials = body.socials.map((s: any) => ({
        platform: String(s.platform || '').trim(),
        url: String(s.url || '').trim(),
      }));
    }

    const updated = await updateContact(updates);
    return NextResponse.json({
      success: true,
      message: 'Data kontak berhasil diperbarui sebagian',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui kontak' },
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
    let platform = searchParams.get('platform');

    if (!platform) {
      try {
        const body = await request.json();
        if (body?.platform) platform = body.platform;
      } catch {
        // no json body
      }
    }

    if (platform) {
      const contact = await getContact();
      const filtered = contact.socials.filter(
        (s) => s.platform.toLowerCase() !== platform!.toLowerCase()
      );
      const updated = await updateContact({ socials: filtered });
      return NextResponse.json({
        success: true,
        message: `Tautan sosial "${platform}" berhasil dihapus`,
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Operasi kontak berhasil',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses permintaan' },
      { status: 500 }
    );
  }
}

