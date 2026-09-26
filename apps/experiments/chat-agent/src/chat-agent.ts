import { generateReply, mapSqlRowsToMessages } from "./lib/chat";
import type { ChatMessage } from "./types/chat";
import type { Env } from "./types/env";

type MessageRow = {
  id: number;
  role: string;
  content: string;
  created_at: string;
};

export class ChatAgent implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      this.state.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (url.pathname === "/ws" && request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket();
    }

    if (method === "POST" && url.pathname === "/chat") {
      return this.handlePost(request);
    }

    if (method === "GET" && url.pathname === "/chat") {
      return Response.json({
        sessionId: this.state.id.toString(),
        messages: this.listMessages(),
      });
    }

    return Response.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
  }

  private listMessages(): ChatMessage[] {
    const rows = this.state.storage.sql
      .exec<MessageRow>("SELECT id, role, content, created_at FROM messages ORDER BY id ASC")
      .toArray();
    return mapSqlRowsToMessages(rows);
  }

  private insertMessage(role: "user" | "assistant", content: string): void {
    const createdAt = new Date().toISOString();
    this.state.storage.sql.exec(
      "INSERT INTO messages (role, content, created_at) VALUES (?, ?, ?)",
      role,
      content,
      createdAt
    );
  }

  private async handlePost(request: Request): Promise<Response> {
    let body: { message?: string };
    try {
      body = (await request.json()) as { message?: string };
    } catch {
      return Response.json({ error: "Invalid JSON body", code: "INVALID_BODY" }, { status: 400 });
    }

    if (!body.message || typeof body.message !== "string") {
      return Response.json(
        { error: "Missing or invalid field: message", code: "INVALID_MESSAGE" },
        { status: 400 }
      );
    }

    this.insertMessage("user", body.message);
    const reply = await generateReply(this.env.AI, body.message);
    this.insertMessage("assistant", reply);

    const messages = this.listMessages();
    this.broadcast({ type: "messages", messages });

    return Response.json({
      sessionId: this.state.id.toString(),
      messages,
    });
  }

  private handleWebSocket(): Response {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);

    server.send(
      JSON.stringify({
        type: "messages",
        messages: this.listMessages(),
      })
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    let payload: { message?: string };
    try {
      const text = typeof message === "string" ? message : new TextDecoder().decode(message);
      payload = JSON.parse(text) as { message?: string };
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "Invalid JSON", code: "INVALID_BODY" }));
      return;
    }

    if (!payload.message || typeof payload.message !== "string") {
      ws.send(JSON.stringify({ type: "error", error: "Missing message", code: "INVALID_MESSAGE" }));
      return;
    }

    this.insertMessage("user", payload.message);
    const reply = await generateReply(this.env.AI, payload.message);
    this.insertMessage("assistant", reply);

    const messages = this.listMessages();
    this.broadcast({ type: "messages", messages });
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close();
    } catch {
      // ignore
    }
  }

  private broadcast(payload: { type: string; messages: ChatMessage[] }): void {
    const encoded = JSON.stringify(payload);
    for (const socket of this.state.getWebSockets()) {
      try {
        socket.send(encoded);
      } catch {
        // ignore closed sockets
      }
    }
  }
}
