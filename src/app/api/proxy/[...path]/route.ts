import { NextRequest, NextResponse } from "next/server";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || "https://admin.staffbook.in/api/web/v1";

async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname.replace("/api/proxy", "");
  const origin = API_ORIGIN.replace(/\/+$/, "");
  const url = `${origin}${path}${request.nextUrl.search}`;

  try {
    const init: RequestInit & { headers: Record<string, string> } = {
      method: request.method,
      headers: { Accept: "application/json" },
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      init.headers["Authorization"] = authHeader;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        init.body = body;
        init.headers["Content-Type"] =
          request.headers.get("content-type") || "application/json";
      }
    }

    const upstream = await fetch(url, init);
    const upstreamBody = await upstream.arrayBuffer();
    const responseHeaders: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        !["content-encoding", "transfer-encoding", "connection", "keep-alive", "host"].includes(lower)
      ) {
        responseHeaders[key] = value;
      }
    });

    return new NextResponse(upstreamBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json(
      { status: 502, message: `API unreachable: ${msg}` },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
