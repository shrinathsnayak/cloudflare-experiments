const ECHO_PREFIX = "echo: ";

export function createEchoWebSocket(): Response {
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  server.accept();

  server.addEventListener("message", (event) => {
    const payload = typeof event.data === "string" ? event.data : String(event.data);
    server.send(`${ECHO_PREFIX}${payload}`);
  });

  server.addEventListener("close", () => {
    server.close();
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

export function isWebSocketUpgrade(request: Request): boolean {
  const upgrade = request.headers.get("Upgrade");
  return upgrade?.toLowerCase() === "websocket";
}

export { ECHO_PREFIX };
