import { NextRequest, NextResponse } from "next/server";

const RESUME_API_ORIGIN = process.env.RESUME_API_ORIGIN || "";

async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!RESUME_API_ORIGIN) {
    return NextResponse.json(
      { status: 502, message: "Resume API not configured. Set RESUME_API_ORIGIN env var." },
      { status: 502 },
    );
  }

  const path = request.nextUrl.pathname.replace("/api/resume-fallback", "");
  const url = `${RESUME_API_ORIGIN}${path}${request.nextUrl.search}`;

  try {
    const init: RequestInit & { headers: Record<string, string> } = {
      method: request.method,
      headers: { Accept: "application/json" },
    };

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
      { status: 502, message: `Resume API unreachable: ${msg}` },
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
