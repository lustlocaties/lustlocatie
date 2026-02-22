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

    await connectToDatabase();

    // Find all accepted requests involving this user (don't use .lean())
    const acceptedRequests = await FriendRequestModel.find({
      status: 'accepted',
      $or: [
        { senderId: payload.sub },
        { receiverId: payload.sub },
      ],
    });

    let synced = 0;
    const details: Array<{
      senderId: string;
      receiverId: string;
      senderFriends: string[];
      receiverFriends: string[];
    }> = [];

    for (const req of acceptedRequests) {
      const senderId = req.senderId; // Keep as ObjectId
      const receiverId = req.receiverId; // Keep as ObjectId

      console.log(`[SYNC] Processing request: ${senderId} <-> ${receiverId}`);

      // Add both to each other's friends array
      const result1 = await UserModel.findByIdAndUpdate(
        senderId,
        { $addToSet: { friends: receiverId } },
        { new: true }
      );

      const result2 = await UserModel.findByIdAndUpdate(
        receiverId,
        { $addToSet: { friends: senderId } },
        { new: true }
      );

      console.log(`[SYNC] Result1 friends:`, result1?.friends);
      console.log(`[SYNC] Result2 friends:`, result2?.friends);

      if (result1 && result2) {
        synced++;
        details.push({
          senderId: String(senderId),
          receiverId: String(receiverId),
          senderFriends: result1.friends?.map(f => String(f)) || [],
          receiverFriends: result2.friends?.map(f => String(f)) || [],
        });
      }
    }

    // Get updated user
    const user = await UserModel.findById(payload.sub);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Synced ${synced} accepted requests`,
      synced,
      details,
      user: {
        _id: String(user._id),
        name: user.name,
        friends: user.friends ? user.friends.map((id) => String(id)) : [],
        friendsCount: user.friends ? user.friends.length : 0,
      },
    });
  } catch (error) {
    console.error('[SYNC]', error);
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
