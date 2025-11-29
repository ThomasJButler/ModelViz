import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Gemini API Proxy Route (Catch-All)
 *
 * This server-side proxy fixes CORS issues when calling Google's Gemini API from the browser.
 * Uses catch-all routing to handle any endpoint path.
 *
 * IMPORTANT: Google API uses API key as query parameter, not header
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 1. Extract API key from request header (internal proxy auth)
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key is required', code: 'MISSING_API_KEY' },
        { status: 401 }
      );
    }

    // 2. Await params and extract endpoint from path params (e.g., ['models', 'gemini-2.0-flash:generateContent'])
    const { path } = await params;
    const endpoint = path?.join('/') || 'models/gemini-2.0-flash:generateContent';

    // 3. Parse request body
    const body = await request.json();

    // 4. Forward to Google API with API key as query parameter
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${apiKey}`;

    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 5. Handle errors from Google
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      return NextResponse.json(
        {
          message: errorData.message || 'Google API error',
          code: errorData.code,
          details: errorData,
        },
        { status: response.status }
      );
    }

    // 6. Return successful response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || 'Internal server error',
        code: 'PROXY_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for model listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key is required', code: 'MISSING_API_KEY' },
        { status: 401 }
      );
    }

    const { path } = await params;
    const endpoint = path?.join('/') || 'models';
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${apiKey}`;

    const response = await fetch(googleUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));

      return NextResponse.json(
        {
          message: errorData.message || 'Google API error',
          code: errorData.code,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || 'Internal server error',
        code: 'PROXY_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
