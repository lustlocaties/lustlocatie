import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;

    return Response.json(
      {
        ok: isConnected,
        status: isConnected ? 'connected' : 'disconnected',
        database: conn.connection.name,
      },
      { status: isConnected ? 200 : 503 },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        status: 'error',
      },
      { status: 500 },
    );
  }
}
