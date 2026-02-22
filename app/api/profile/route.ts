import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/User';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated.' },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid session.' },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(payload.sub).select('-passwordHash').lean();

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
    console.error('[PROFILE GET]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch profile.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated.' },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Invalid session.' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[PROFILE PUT] Validation error:', parsed.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Invalid request body.',
          details: parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    console.log('[PROFILE PUT] Request body:', body);
    console.log('[PROFILE PUT] Parsed data:', parsed.data);

    // Remove empty strings and undefined values
    const updateData: Record<string, unknown> = {
      bio_updated_at: new Date(),
    };

    Object.entries(parsed.data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        updateData[key] = value;
      }
    });

    console.log('[PROFILE PUT] Final update data:', updateData);

    const user = await UserModel.findByIdAndUpdate(
      payload.sub,
      updateData,
      { new: true, runValidators: true },
    ).select('-passwordHash').lean();

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
    console.error('[PROFILE PUT]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to update profile.' },
      { status: 500 },
    );
  }
}
