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

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({
        ok: true,
        users: [],
      });
    }

    await connectToDatabase();

    // Get current user's blocked list
    const currentUser = await UserModel.findById(payload.sub).select('blockedUsers').lean();
    const blockedUserIds = currentUser?.blockedUsers || [];

    // Search for users by name or email, excluding current user and blocked users
    const users = await UserModel.find(
      {
        _id: { $ne: payload.sub, $nin: blockedUserIds },
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      },
      'name email avatarUrl location bio'
    )
      .limit(20)
      .lean();

    return NextResponse.json({
      ok: true,
      users: users.map(user => ({
        _id: String(user._id),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        location: user.location,
        bio: user.bio,
      })),
    });
  } catch (error) {
    console.error('[SEARCH_USERS]', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
