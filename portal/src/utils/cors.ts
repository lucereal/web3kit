import { NextRequest, NextResponse } from 'next/server';

export enum CorsPolicy {
  FRONTEND_ONLY = 'frontend_only',
  WEBHOOK_ONLY = 'webhook_only', 
  PUBLIC = 'public'
}

export function setCorsHeaders(req: NextRequest, res: NextResponse, policy: CorsPolicy) {
  switch (policy) {
    case CorsPolicy.FRONTEND_ONLY:
      // Check for allowed origins from environment variable
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
      const origin = req.headers.get('origin');
      
      if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin);
      } else if (allowedOrigins && allowedOrigins.length > 0) {
        // Fallback to first allowed origin if no match
        res.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
      } else {
        // No allowed origins configured, do not set header or set to a safe default
        res.headers.set('Access-Control-Allow-Origin', '');
      }
      
      res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.headers.set('Access-Control-Allow-Credentials', 'true');
      break;
      
    case CorsPolicy.WEBHOOK_ONLY:
      // No CORS headers for webhook endpoints (Alchemy only)
      break;
      
    case CorsPolicy.PUBLIC:
      // Allow all origins
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      break;
  }
}

