import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/";

  draftMode().disable();

  return NextResponse.redirect(new URL(redirect, request.url));
}
