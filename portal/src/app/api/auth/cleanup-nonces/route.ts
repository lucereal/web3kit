import { nonceRepository } from '@/lib/db/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Optional cleanup endpoint to remove expired nonces
 * Can be called by a cron job or scheduled task
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const deletedCount = await nonceRepository.cleanupExpiredNonces();

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} expired nonces`,
      deletedCount 
    });

  } catch (err) {
    console.error('Nonce cleanup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
