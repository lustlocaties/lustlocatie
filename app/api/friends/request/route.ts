import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';
import { FriendRequestModel } from '@/lib/models/FriendRequest';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const { receiverId } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if already friends
    const currentUser = await UserModel.findById(payload.sub).select('friends').lean();
    const isFriend = currentUser?.friends?.some(id => String(id) === receiverId);

    if (isFriend) {
      return NextResponse.json(
        { error: 'Already friends' },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await FriendRequestModel.findOne({
      $or: [
        { senderId: payload.sub, receiverId },
        { senderId: receiverId, receiverId: payload.sub },
      ],
    });

    if (existingRequest) {
      // If request is already accepted, add to friends arrays if not already there
      if (existingRequest.status === 'accepted') {
        // Synchronize: add to friends arrays
        await UserModel.findByIdAndUpdate(payload.sub, {
          $addToSet: { friends: receiverId },
        });

        await UserModel.findByIdAndUpdate(receiverId, {
          $addToSet: { friends: payload.sub },
        });

        return NextResponse.json({
          ok: true,
          message: 'Already friends! Synchronized.',
          request: {
            id: String(existingRequest._id),
            status: 'accepted',
          },
        });
      }

      // If request is pending, reject
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'Friend request already pending' },
          { status: 400 }
        );
      }
    }

    // Create friend request
    const friendRequest = await FriendRequestModel.create({
      senderId: payload.sub,
      receiverId,
      status: 'pending',
    });

    return NextResponse.json({
      ok: true,
      request: {
        id: String(friendRequest._id),
        status: friendRequest.status,
      },
    });
  } catch (error) {
    console.error('[CREATE_FRIEND_REQUEST]', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
