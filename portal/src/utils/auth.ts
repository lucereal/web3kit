import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface DecodedToken {
  address: string;
  wallet?: string;
  resourceId?: string;
  usageLeft?: number;
  expiresAt?: number;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token from the request headers and returns the decoded payload
 * @param req - The request object (VercelRequest or NextApiRequest)
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(req: NextRequest): DecodedToken | null {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization') || '';

    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return null;
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extracts just the user address from the JWT token
 * @param req - The request object
 * @returns The user address or null if invalid token
 */
export function verifyTokenAndGetAddress(req: NextRequest): string | null {
  const decoded = verifyToken(req);
  return decoded?.address || decoded?.wallet || null;
}

/**
 * Middleware-style function for token verification with automatic error response
 * @param req - The request object
 * @param res - The response object
 * @returns The decoded token or sends error response and returns null
 */
export function requireAuth(req: NextRequest, res: NextResponse): DecodedToken | null {
  const decoded = verifyToken(req);
  
  if (!decoded) {
    res = NextResponse.json({ error: 'Unauthorized - Invalid or missing token' }, { status: 401, headers: res.headers });
    return null;
  }
  
  return decoded;
}

/**
 * Checks if the token has access to a specific resource
 * @param req - The request object
 * @param resourceId - The resource ID to check access for
 * @returns True if user has access, false otherwise
 */
export function hasResourceAccess(req: NextRequest, resourceId: string): boolean {
  const decoded = verifyToken(req);
  
  if (!decoded) {
    return false;
  }

  // If token contains resource-specific info, check it
  if (decoded.resourceId) {
    return decoded.resourceId === resourceId;
  }

  // If it's just an auth token (from verify-signature), allow access
  // You might want to implement additional Redis-based access checking here
  return true;
}

/**
 * Type guard to check if a token is a resource access token
 */
export function isResourceToken(decoded: DecodedToken): boolean {
  return !!(decoded.resourceId && decoded.usageLeft !== undefined);
}

/**
 * Type guard to check if a token is an authentication token
 */
export function isAuthToken(decoded: DecodedToken): boolean {
  return !!(decoded.address && !decoded.resourceId);
}
