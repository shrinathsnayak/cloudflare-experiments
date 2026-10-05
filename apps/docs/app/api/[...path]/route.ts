import { jsonApiNotFound, jsonMethodNotAllowed } from "@/lib/api-error";

type RouteContext = { params: Promise<{ path: string[] }> };

async function notFoundResponse(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const pathname = `/api/${path.join("/")}`;
  return jsonApiNotFound(pathname);
}

export async function GET(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function HEAD(request: Request, context: RouteContext) {
  return notFoundResponse(request, context);
}

export async function OPTIONS() {
  return jsonMethodNotAllowed(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);
}
