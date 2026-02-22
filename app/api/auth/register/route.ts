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
    console.log('[REGISTER] Request body:', body);
    
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[REGISTER] Validation failed:', parsed.error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request body: ' + JSON.stringify(parsed.error.flatten()),
        },
        { status: 400 },
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    console.log('[REGISTER] Connecting to database...');
    await connectToDatabase();
    console.log('[REGISTER] Database connected');

    const existingUser = await UserModel.findOne({ email }).lean();
    if (existingUser) {
      console.log('[REGISTER] User already exists:', email);
      return NextResponse.json(
        {
          ok: false,
          error: 'Email is already in use.',
        },
        { status: 409 },
      );
    }

    console.log('[REGISTER] Hashing password...');
    const passwordHash = await hashPassword(password);

    console.log('[REGISTER] Creating user...');
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
      role: 'user',
      isActive: true,
    });
    console.log('[REGISTER] User created:', user._id);

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
  } catch (error) {
    console.error('[REGISTER] Error:', error instanceof Error ? error.message : String(error));
    console.error('[REGISTER] Full error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Registration failed.',
      },
      { status: 500 },
    );
  }
}
