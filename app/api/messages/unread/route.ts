import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { MessageModel } from '@/lib/models/Message';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated.' },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid session.' },
        { status: 401 },
      );
    }

    await connectToDatabase();

    // Count unread messages for current user
    const unreadCount = await MessageModel.countDocuments({
      recipientId: payload.sub,
      isRead: false,
    });

    return NextResponse.json({
      ok: true,
      unreadCount,
    });
  } catch (error) {
    console.error('[MESSAGES UNREAD COUNT]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch unread count.' },
      { status: 500 },
    );
  }
}
