import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { MessageModel } from '@/lib/models/Message';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
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

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID is required.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if users are friends
    const currentUser = await UserModel.findById(payload.sub).select('friends').lean();
    const isFriend = currentUser?.friends?.some(id => String(id) === userId);

    if (!isFriend) {
      return NextResponse.json(
        { ok: false, error: 'You must be friends to view this conversation.' },
        { status: 403 },
      );
    }

    // Get all messages in conversation between two users
    const messages = await MessageModel.find({
      $or: [
        { senderId: payload.sub, recipientId: userId },
        { senderId: userId, recipientId: payload.sub },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read if they were sent to current user
    if (messages.length > 0) {
      await MessageModel.updateMany(
        {
          recipientId: payload.sub,
          senderId: userId,
          isRead: false,
        },
        { isRead: true },
      );
    }

    return NextResponse.json({
      ok: true,
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        content: msg.content,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('[MESSAGES GET BY USER]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch conversation.' },
      { status: 500 },
    );
  }
}
