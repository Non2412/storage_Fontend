import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://storage-backend-steel.vercel.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params);
}

async function handleProxy(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>
) {
  try {
    const { path } = await paramsPromise;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/api/${pathString}${url.search}`;

    // Get headers from original request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Get body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
        console.log(`[Proxy] Incoming Body for ${targetUrl}:`, body);
      } catch (e) {
        console.warn('[Proxy] Failed to read body:', e);
      }
    }

    console.log(`[Proxy] Forwarding ${request.method} to: ${targetUrl}`);

    // Make request to backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    console.log(`[Proxy] Backend Response Status: ${response.status}`);

    // Get response data
    const data = await response.text();
    console.log(`[Proxy] Backend Response Body Preview:`, data.substring(0, 200));

    // Return response with CORS headers
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error: Failed to connect to backend' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
