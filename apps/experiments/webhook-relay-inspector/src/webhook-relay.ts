import { MAX_BODY_BYTES, MAX_STORED_REQUESTS } from "./constants/defaults";
import {
  REQUEST_INDEX_KEY,
  SESSION_META_KEY,
  createSessionMeta,
  requestStorageKey,
} from "./lib/relay";
import { buildCapturedRequest, sortSummariesNewestFirst, summarizeRequest } from "./lib/capture";
import type { CapturedRequest, CapturedRequestSummary, RelaySessionMeta } from "./types/relay";

const CAPTURE_PATH_PATTERN = /^\/relay\/[^/]+$/;

export class WebhookRelay implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/init") {
      const body = (await request.json()) as { id?: string };
      const id = body.id?.trim();
      if (!id) {
        return Response.json({ error: "Missing relay id", code: "INVALID_ID" }, { status: 400 });
      }

      const meta = createSessionMeta(id);
      await this.state.storage.put(SESSION_META_KEY, meta);
      await this.state.storage.put(REQUEST_INDEX_KEY, [] as string[]);
      return Response.json(meta, { status: 201 });
    }

    if (request.method === "GET" && url.pathname === "/requests") {
      const session = await this.state.storage.get<RelaySessionMeta>(SESSION_META_KEY);
      if (!session) {
        return Response.json(
          { error: "Relay session not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const summaries = await this.listRequestSummaries();
      return Response.json({ id: session.id, requests: summaries });
    }

    const detailMatch = url.pathname.match(/^\/requests\/([^/]+)$/);
    if (request.method === "GET" && detailMatch) {
      const requestId = detailMatch[1];
      const session = await this.state.storage.get<RelaySessionMeta>(SESSION_META_KEY);
      if (!session) {
        return Response.json(
          { error: "Relay session not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const record = await this.state.storage.get<CapturedRequest>(requestStorageKey(requestId));
      if (!record) {
        return Response.json({ error: "Request not found", code: "NOT_FOUND" }, { status: 404 });
      }

      return Response.json(record);
    }

    if (CAPTURE_PATH_PATTERN.test(url.pathname)) {
      const session = await this.state.storage.get<RelaySessionMeta>(SESSION_META_KEY);
      if (!session) {
        return Response.json(
          { error: "Relay session not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const captured = await buildCapturedRequest(request, MAX_BODY_BYTES);
      await this.storeRequest(captured);

      return Response.json(
        {
          requestId: captured.id,
          captured: true,
          timestamp: captured.timestamp,
        },
        { status: 202 }
      );
    }

    return new Response("Not found", { status: 404 });
  }

  private async storeRequest(record: CapturedRequest): Promise<void> {
    const index = (await this.state.storage.get<string[]>(REQUEST_INDEX_KEY)) ?? [];
    const nextIndex = [record.id, ...index.filter((id) => id !== record.id)].slice(
      0,
      MAX_STORED_REQUESTS
    );

    await this.state.storage.put(requestStorageKey(record.id), record);
    await this.state.storage.put(REQUEST_INDEX_KEY, nextIndex);

    const staleIds = index.filter((id) => !nextIndex.includes(id));
    await Promise.all(staleIds.map((id) => this.state.storage.delete(requestStorageKey(id))));
  }

  private async listRequestSummaries(): Promise<CapturedRequestSummary[]> {
    const index = (await this.state.storage.get<string[]>(REQUEST_INDEX_KEY)) ?? [];
    const records = await Promise.all(
      index.map((id) => this.state.storage.get<CapturedRequest>(requestStorageKey(id)))
    );

    const summaries = records
      .filter((record): record is CapturedRequest => record !== undefined)
      .map((record) => summarizeRequest(record));

    return sortSummariesNewestFirst(summaries);
  }
}
