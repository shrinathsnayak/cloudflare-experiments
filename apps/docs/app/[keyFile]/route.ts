import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ keyFile: string }>;
};

/**
 * IndexNow ownership verification (Bing Option 1):
 * https://cloudflare-experiments.com/{INDEXNOW_KEY}.txt
 * Body must be exactly the key — no extra whitespace.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { keyFile } = await context.params;
  const key = process.env.INDEXNOW_KEY?.trim();

  if (!key || keyFile !== `${key}.txt`) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
