import { NextRequest, NextResponse } from "next/server";

const buildResponse = (request: NextRequest, status: number, body: Record<string, unknown>) => {
  const origin = request.headers.get("origin") ?? "*";
  const response = NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
      "Cache-Control": "no-store",
    },
  });

  if (origin === "*") {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  return response;
};

export function GET(request: NextRequest) {
  return buildResponse(request, 200, { ok: true, timestamp: Date.now() });
}

export function OPTIONS(request: NextRequest) {
  return buildResponse(request, 200, { ok: true });
}
