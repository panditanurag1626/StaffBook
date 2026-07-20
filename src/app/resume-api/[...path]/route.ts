import { NextRequest, NextResponse } from "next/server";

/**
 * Destination origin for the proxy — set via server-only env var.
 * Must be a full URL (https://...) — NOT a relative path.
 *
 * Example:
 *   RESUME_API_ORIGIN=https://resume.codekrafters.co.in
 */
const RESUME_API_ORIGIN = process.env.RESUME_API_ORIGIN || '';

/**
 * Proxy /resume-api/* → external Resume API.
 *
 * This handler provides a CORS-free path for browser code: the client calls
 * a same-origin URL (/resume-api/...), and the Next.js server forwards the
 * request to the external API.  The client never talks to the external origin
 * directly, so CORS is never an issue.
 *
 * All new code should import from `@/services/resumeApi`.  The base URL in
 * that module defaults to `/resume-api`, which routes traffic through here.
 */
async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!RESUME_API_ORIGIN) {
    return NextResponse.json(
      { status: 502, message: "Resume API proxy not configured. Set RESUME_API_ORIGIN env var." },
      { status: 502 },
    );
  }

  const path = request.nextUrl.pathname.replace("/resume-api", "");
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
