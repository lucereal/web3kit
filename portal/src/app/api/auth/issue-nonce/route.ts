import { setCorsHeaders, CorsPolicy } from '@/utils/cors';
import { NextRequest, NextResponse } from 'next/server';
import { nonceService } from '@/lib/services/nonce-service';
import crypto from 'crypto';

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight
  const response = new NextResponse(null, { status: 200 });
  setCorsHeaders(req, response, CorsPolicy.FRONTEND_ONLY);
  return response;
}

export async function POST(req: NextRequest) {
  try {
    // Set CORS headers for actual requests
    const response = NextResponse.json({ success: true });
    setCorsHeaders(req, response, CorsPolicy.FRONTEND_ONLY);

    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address' },
        { status: 400 }
      );
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Store nonce using Supabase service
    await nonceService.storeNonce(address, nonce);

    return NextResponse.json({ nonce });

  } catch (err) {
    console.error('Nonce generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}