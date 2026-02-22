import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user's friends
    const currentUser = await UserModel.findById(payload.sub).select('friends').lean();

    if (!currentUser) {
      return NextResponse.json({
        ok: true,
        friends: [],
      });
    }

    const friendIds = currentUser.friends || [];

    if (friendIds.length === 0) {
      return NextResponse.json({
        ok: true,
        friends: [],
      });
    }

    const friends = await UserModel.find(
      { _id: { $in: friendIds } },
      'name email avatarUrl location bio website'
    ).lean();

    return NextResponse.json({
      ok: true,
      friends: friends.map(friend => ({
        _id: String(friend._id),
        name: friend.name,
        email: friend.email,
        avatarUrl: friend.avatarUrl,
        location: friend.location,
        bio: friend.bio,
      })),
    });
  } catch (error) {
    console.error('[GET_FRIENDS]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}
