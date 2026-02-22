import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { FriendRequestModel } from '@/lib/models/FriendRequest';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get outgoing friend requests (sent by current user with pending status)
    const requests = await FriendRequestModel.find({
      senderId: payload.sub,
      status: 'pending',
    })
      .populate('receiverId', 'name email avatarUrl location bio')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      ok: true,
      requests: requests.map(req => ({
        id: String(req._id),
        receiver: {
          id: String(req.receiverId._id),
          name: req.receiverId.name,
          email: req.receiverId.email,
          avatarUrl: req.receiverId.avatarUrl,
          location: req.receiverId.location,
          bio: req.receiverId.bio,
        },
        status: req.status,
        createdAt: req.createdAt,
      })),
    });
  } catch (error) {
    console.error('[OUTGOING REQUESTS]', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
