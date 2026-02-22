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
        {
          ok: false,
          error: 'Not authenticated.',
        },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid session.',
        },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(payload.sub).lean();

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          ok: false,
          error: 'User not found.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Not authenticated.',
      },
      { status: 401 },
    );
  }
}
