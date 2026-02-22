import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { MessageModel } from '@/lib/models/Message';
import { UserModel } from '@/lib/models/User';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required.'),
  content: z.string().trim().min(1).max(5000),
});

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

    // Get messages for current user (both sent and received)
    const messages = await MessageModel.find({
      $or: [
        { senderId: payload.sub },
        { recipientId: payload.sub },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Get unique conversation partners with their info
    const conversationPartners = new Map();

    for (const message of messages) {
      const partnerId = message.senderId === payload.sub ? message.recipientId : message.senderId;

      if (!conversationPartners.has(partnerId)) {
        const partner = await UserModel.findById(partnerId)
          .select('name avatarUrl')
          .lean();

        if (partner) {
          conversationPartners.set(partnerId, {
            id: partnerId,
            name: partner.name,
            avatarUrl: partner.avatarUrl,
            lastMessage: message,
            unreadCount: 0,
          });
        }
      }

      // Count unread messages from this partner
      if (message.recipientId === payload.sub && !message.isRead) {
        const conv = conversationPartners.get(partnerId);
        if (conv) {
          conv.unreadCount += 1;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      conversations: Array.from(conversationPartners.values()).sort(
        (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime(),
      ),
    });
  } catch (error) {
    console.error('[MESSAGES GET]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch messages.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const { recipientId, content } = parsed.data;

    // Prevent self-messaging
    if (recipientId === payload.sub) {
      return NextResponse.json(
        { ok: false, error: 'Cannot send message to yourself.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Verify recipient exists
    const recipient = await UserModel.findById(recipientId).lean();
    if (!recipient) {
      return NextResponse.json(
        { ok: false, error: 'Recipient not found.' },
        { status: 404 },
      );
    }

    // Check if users are friends
    const currentUser = await UserModel.findById(payload.sub).select('friends').lean();
    const isFriend = currentUser?.friends?.some(id => String(id) === recipientId);

    if (!isFriend) {
      return NextResponse.json(
        { ok: false, error: 'You must be friends to send messages.' },
        { status: 403 },
      );
    }

    // Create message
    const message = await MessageModel.create({
      senderId: payload.sub,
      recipientId,
      content,
      isRead: false,
    });

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: message._id.toString(),
          senderId: message.senderId,
          recipientId: message.recipientId,
          content: message.content,
          isRead: message.isRead,
          createdAt: message.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[MESSAGES POST]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to send message.' },
      { status: 500 },
    );
  }
}
