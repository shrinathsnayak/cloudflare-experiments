import { NextResponse } from "next/server";

/**
 * IndexNow ownership verification file.
 * Search engines fetch this URL (via keyLocation) and expect the raw key.
 * Set INDEXNOW_KEY in the hosting env (Vercel/etc.) — never commit the value.
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
