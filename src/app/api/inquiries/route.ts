import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/server-storage';
import { InquiryItem } from '@/data/contact';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

// GET all inquiries (Protected)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await readStore<InquiryItem[]>('inquiries');
    return NextResponse.json({ success: true, items }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST new inquiry (Public submission from website contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      );
    }

    const items = await readStore<InquiryItem[]>('inquiries');
    const newId = `inq-${Date.now().toString().slice(-6)}`;

    const newInquiry: InquiryItem = {
      id: newId,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
      inquiryType: body.inquiryType || 'Film & Acting Project',
      subject: body.subject?.trim() || `${body.inquiryType || 'Inquiry'} from ${body.name.trim()}`,
      message: body.message.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'New',
    };

    const updated = [newInquiry, ...items];
    await writeStore('inquiries', updated);

    return NextResponse.json({
      success: true,
      id: newId,
      item: newInquiry,
      message: 'Inquiry received successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT update inquiry status or notes (Protected)
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const items = await readStore<InquiryItem[]>('inquiries');
    const index = items.findIndex((i) => i.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    items[index] = {
      ...items[index],
      ...body,
      id: items[index].id,
    };

    await writeStore('inquiries', items);
    return NextResponse.json({ success: true, item: items[index], items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE an inquiry (Protected)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const items = await readStore<InquiryItem[]>('inquiries');
    const filtered = items.filter((i) => i.id !== id);

    await writeStore('inquiries', filtered);
    return NextResponse.json({ success: true, id, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
