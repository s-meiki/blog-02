import { NextRequest, NextResponse } from "next/server";

const ACCESS_CONTROL_ALLOW_HEADERS = "Content-Type, Authorization";
const ACCESS_CONTROL_ALLOW_METHODS = "GET,OPTIONS";

const setCorsHeaders = (response: NextResponse, originHeader: string | null) => {
  const origin = originHeader ?? "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", ACCESS_CONTROL_ALLOW_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ACCESS_CONTROL_ALLOW_HEADERS);
  response.headers.set("Vary", "Origin");
  return response;
};

const buildJsonResponse = (request: NextRequest, body: Record<string, unknown>, status = 200) => {
  const response = NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });

  return setCorsHeaders(response, request.headers.get("origin"));
};

export function GET(request: NextRequest) {
  return buildJsonResponse(request, { ok: true });
}

export function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, request.headers.get("origin"));
}
