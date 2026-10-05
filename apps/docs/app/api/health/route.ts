import { jsonMethodNotAllowed } from "@/lib/api-error";
import { applySecurityHeaders } from "@/lib/security-headers";
import { appName } from "@/lib/shared";

export function GET() {
  const body = JSON.stringify({
    status: "ok",
    name: appName,
    time: new Date().toISOString(),
  });
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  applySecurityHeaders(headers);
  return new Response(body, { headers });
}

export function POST() {
  return jsonMethodNotAllowed(["GET"]);
}

export function PUT() {
  return jsonMethodNotAllowed(["GET"]);
}

export function PATCH() {
  return jsonMethodNotAllowed(["GET"]);
}

export function DELETE() {
  return jsonMethodNotAllowed(["GET"]);
}
