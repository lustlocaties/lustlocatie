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

    // Get current user's friends with explicit handling
    const currentUser = await UserModel.findById(payload.sub).lean();

    if (!currentUser) {
      return NextResponse.json({
        ok: true,
        contacts: [],
      });
    }

    // Get friends array, default to empty if not present
    const friendIds = currentUser.friends || [];

    if (friendIds.length === 0) {
      return NextResponse.json({
        ok: true,
        contacts: [],
      });
    }

    // Fetch all friends
    const friends = await UserModel.find(
      { _id: { $in: friendIds } },
      'name email avatarUrl location bio website'
    ).lean();

    return NextResponse.json({
      ok: true,
      contacts: friends.map(friend => ({
        _id: String(friend._id),
        name: friend.name || '',
        email: friend.email || '',
        avatarUrl: friend.avatarUrl || '',
        location: friend.location || '',
        bio: friend.bio || '',
        website: friend.website || '',
      })),
    });
  } catch (error) {
    console.error('[CONTACTS_ERROR]', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to fetch contacts', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
