import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { AUTH_COOKIE_NAME, signAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request body.',
        },
        { status: 400 },
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Email is already in use.',
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: 'user',
      isActive: true,
    });

    const token = await signAuthToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );

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
        error: 'Registration failed.',
      },
      { status: 500 },
    );
  }
}
