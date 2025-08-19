import { setCorsHeaders } from '@/utils/cors';
import { CorsPolicy } from '@/utils/cors';
import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';
import jwt, { Secret } from 'jsonwebtoken';
import { type StringValue } from 'ms';
import { nonceService } from '@/lib/services/nonce-service';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY as StringValue || '24h';

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight
  const response = new NextResponse(null, { status: 200 });
  setCorsHeaders(req, response, CorsPolicy.FRONTEND_ONLY);
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Set CORS headers for actual requests
    setCorsHeaders(req, response, CorsPolicy.FRONTEND_ONLY);

    const body = await req.json();
    const { address, signature } = body;

    if (!address || !signature) {
      return NextResponse.json(
        { error: 'Missing address or signature' },
        { status: 400 }
      );
    }

    // Get nonce from Supabase
    const nonceData = await nonceService.getNonce(address);

    if (!nonceData) {
      return NextResponse.json(
        { error: 'Nonce expired or not found' },
        { status: 400 }
      );
    }

    const { nonce } = nonceData;

    const message = `Login to Web3kit:\nNonce: ${nonce}`;
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Invalidate nonce (delete it so it can't be reused)
    await nonceService.deleteNonce(address);

    // Create JWT
    const token = jwt.sign(
      { address: address as string }, 
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRY }
    );

    return NextResponse.json({ success: true, token });

  } catch (err) {
    console.error('Signature verification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


