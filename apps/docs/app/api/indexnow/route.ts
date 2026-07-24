import { createHmac, timingSafeEqual } from "node:crypto";
import { connection, NextResponse } from "next/server";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

type VercelWebhookEvent = {
  type?: string;
  payload?: {
    target?: string | null;
    deployment?: {
      target?: string | null;
      meta?: {
        githubCommitRef?: string;
      };
    };
  };
};

function getWebhookSecret(): string | null {
  return process.env.INDEXNOW_WEBHOOK_SECRET?.trim() || null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verifyBearer(request: Request, secret: string): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return safeEqual(header.slice("Bearer ".length).trim(), secret);
}

function verifyVercelSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = createHmac("sha1", secret).update(rawBody).digest("hex");
  return safeEqual(digest, signature);
}

function isProductionDeploy(event: VercelWebhookEvent): boolean {
  const target = event.payload?.target ?? event.payload?.deployment?.target;
  return target === "production";
}

function isMainBranch(event: VercelWebhookEvent): boolean {
  const ref = event.payload?.deployment?.meta?.githubCommitRef;
  // Some deploys omit meta; production target is the stronger signal.
  return !ref || ref === "main" || ref === "refs/heads/main";
}

export async function POST(request: Request) {
  await connection();

  const secret = getWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "INDEXNOW_WEBHOOK_SECRET is not configured", code: "MISCONFIGURED" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");
  const isBearer = verifyBearer(request, secret);
  const isSigned = verifyVercelSignature(rawBody, signature, secret);

  if (!isBearer && !isSigned) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Vercel deploy webhook: only production deploys from main.
  if (isSigned && rawBody) {
    let event: VercelWebhookEvent;
    try {
      event = JSON.parse(rawBody) as VercelWebhookEvent;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body", code: "INVALID_BODY" }, { status: 400 });
    }

    if (event.type && event.type !== "deployment.succeeded") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: `Ignored event type: ${event.type}`,
      });
    }

    if (!isProductionDeploy(event)) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Not a production deployment",
      });
    }

    if (!isMainBranch(event)) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Not a main-branch deployment",
      });
    }
  }

  let urls: string[] | undefined;
  if (isBearer && rawBody) {
    try {
      const parsed = JSON.parse(rawBody) as { urls?: string[] };
      if (Array.isArray(parsed.urls)) {
        urls = parsed.urls.filter((u): u is string => typeof u === "string");
      }
    } catch {
      // Empty body is fine for bearer-triggered full sitemap submit.
    }
  }

  try {
    const result = await submitUrlsToIndexNow(urls);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "IndexNow submit failed";
    return NextResponse.json({ error: message, code: "INDEXNOW_ERROR" }, { status: 502 });
  }
}
