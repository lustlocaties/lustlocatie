import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID is required.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Only expose non-sensitive fields
    const user = await UserModel.findById(userId)
      .select('name avatarUrl bio location website gender createdAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error('[PROFILE GET BY ID]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch user profile.' },
      { status: 500 },
    );
  }
}
