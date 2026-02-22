import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params;

    await connectToDatabase();

    // Remove friend from both users' friend lists
    await UserModel.findByIdAndUpdate(payload.sub, {
      $pull: { friends: userId },
    });

    await UserModel.findByIdAndUpdate(userId, {
      $pull: { friends: payload.sub },
    });

    return NextResponse.json({
      ok: true,
      message: 'Friend removed',
    });
  } catch (error) {
    console.error('[DELETE_FRIEND]', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
