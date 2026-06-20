import type { CursorMessage } from "./types/env";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

function pickColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % COLORS.length;
  }
  return COLORS[hash] ?? COLORS[0];
}

export class CursorRoom implements DurableObject {
  private state: DurableObjectState;
  private sessions = new Map<WebSocket, { id: string; color: string; name: string }>();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);

    const id = crypto.randomUUID();
    const color = pickColor(id);
    const name = `Guest-${id.slice(0, 4)}`;
    this.sessions.set(server, { id, color, name });

    server.send(JSON.stringify({ type: "join", id, color, name } satisfies CursorMessage));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;

    let payload: { x?: number; y?: number };
    try {
      payload = JSON.parse(
        typeof message === "string" ? message : new TextDecoder().decode(message)
      );
    } catch {
      return;
    }

    if (typeof payload.x !== "number" || typeof payload.y !== "number") {
      return;
    }

    const outgoing: CursorMessage = {
      type: "cursor",
      id: session.id,
      x: payload.x,
      y: payload.y,
      color: session.color,
      name: session.name,
    };
    const encoded = JSON.stringify(outgoing);

    for (const socket of this.state.getWebSockets()) {
      if (socket !== ws) {
        try {
          socket.send(encoded);
        } catch {
          // ignore closed sockets
        }
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;

    this.sessions.delete(ws);
    const encoded = JSON.stringify({
      type: "leave",
      id: session.id,
      color: session.color,
      name: session.name,
    } satisfies CursorMessage);

    for (const socket of this.state.getWebSockets()) {
      try {
        socket.send(encoded);
      } catch {
        // ignore
      }
    }
  }
}
