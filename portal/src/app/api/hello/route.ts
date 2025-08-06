import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests
export async function GET(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    const method = 'GET';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    return NextResponse.json({
      message: "Hello from Vercel!",
      timestamp: currentTime,
      method: method,
      userAgent: userAgent,
      success: true
    });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    const method = 'POST';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    return NextResponse.json({
      message: "Hello from Vercel!",
      timestamp: currentTime,
      method: method,
      userAgent: userAgent,
      success: true
    });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Handle PUT requests
export async function PUT(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    const method = 'PUT';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    return NextResponse.json({
      message: "Hello from Vercel!",
      timestamp: currentTime,
      method: method,
      userAgent: userAgent,
      success: true
    });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Handle DELETE requests
export async function DELETE(request: NextRequest) {
  try {
    const currentTime = new Date().toISOString();
    const method = 'DELETE';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    return NextResponse.json({
      message: "Hello from Vercel!",
      timestamp: currentTime,
      method: method,
      userAgent: userAgent,
      success: true
    });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  }
}