import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { FriendRequestModel } from '@/lib/models/FriendRequest';

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

    // Get pending requests for current user
    const requests = await FriendRequestModel.find({
      receiverId: payload.sub,
      status: 'pending',
    })
      .populate('senderId', 'name email avatarUrl location bio')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      requests: requests.map(req => ({
        id: String(req._id),
        sender: {
          id: String(req.senderId._id),
          name: req.senderId.name,
          email: req.senderId.email,
          avatarUrl: req.senderId.avatarUrl,
          location: req.senderId.location,
          bio: req.senderId.bio,
        },
        createdAt: req.createdAt,
      })),
    });
  } catch (error) {
    console.error('[GET_FRIEND_REQUESTS]', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}
