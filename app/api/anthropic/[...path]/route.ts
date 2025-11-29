import { NextRequest, NextResponse } from 'next/server';

/**
 * Anthropic API Proxy Route (Catch-All)
 *
 * This server-side proxy fixes CORS issues when calling Anthropic's API from the browser.
 * The browser calls this route (same origin, no CORS), and we forward the request to Anthropic.
 * Uses catch-all routing to handle any endpoint path.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 1. Extract API key from request header
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key is required', code: 'MISSING_API_KEY' },
        { status: 401 }
      );
    }

    // 2. Await params and extract endpoint from path params (e.g., ['messages'] or ['models'])
    const { path } = await params;
    const endpoint = path?.join('/') || 'messages';

    // 3. Parse request body
    const body = await request.json();

    // 4. Forward to Anthropic API with dynamic endpoint
    const anthropicUrl = `https://api.anthropic.com/v1/${endpoint}`;

    const response = await fetch(anthropicUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 5. Handle errors from Anthropic
    if (!response.ok) {
      const errorText = await response.text();

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }

      return NextResponse.json(
        {
          message: errorData.message || 'Anthropic API error',
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

// Handle OPTIONS for CORS preflight (if needed for development)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
