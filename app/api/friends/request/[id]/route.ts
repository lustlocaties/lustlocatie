import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';
import { FriendRequestModel } from '@/lib/models/FriendRequest';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { action } = await request.json();

    if (!['accept', 'reject', 'block'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const friendRequest = await FriendRequestModel.findById(id);

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // Verify current user is the receiver
    if (String(friendRequest.receiverId) !== payload.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (action === 'accept') {
      // Add each other as friends
      await UserModel.findByIdAndUpdate(payload.sub, {
        $addToSet: { friends: friendRequest.senderId },
      });

      await UserModel.findByIdAndUpdate(friendRequest.senderId, {
        $addToSet: { friends: payload.sub },
      });

      friendRequest.status = 'accepted';
      await friendRequest.save();
    } else if (action === 'reject') {
      friendRequest.status = 'rejected';
      await friendRequest.save();
    } else if (action === 'block') {
      // Add to blocked users
      await UserModel.findByIdAndUpdate(payload.sub, {
        $addToSet: { blockedUsers: friendRequest.senderId },
      });

      friendRequest.status = 'blocked';
      await friendRequest.save();
    }

    return NextResponse.json({
      ok: true,
      status: friendRequest.status,
    });
  } catch (error) {
    console.error('[UPDATE_FRIEND_REQUEST]', error);
    return NextResponse.json(
      { error: 'Failed to update friend request' },
      { status: 500 }
    );
  }
}
