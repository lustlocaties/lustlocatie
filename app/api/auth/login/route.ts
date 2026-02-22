import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db/mongoose';
import { AUTH_COOKIE_NAME, signAuthToken } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { UserModel } from '@/lib/models/User';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request body.',
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    await connectToDatabase();

    const user = await UserModel.findOne({ email }).lean();

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid credentials.',
        },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid credentials.',
        },
        { status: 401 },
      );
    }

    const token = await signAuthToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Login failed.',
      },
      { status: 500 },
    );
  }
}
