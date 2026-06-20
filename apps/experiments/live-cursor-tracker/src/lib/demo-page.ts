export const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Live Cursor Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    header { padding: 1rem 1.5rem; border-bottom: 1px solid #334155; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    #room { background: #1e293b; border: 1px solid #475569; border-radius: 6px; padding: 0.35rem 0.6rem; color: inherit; width: 10rem; }
    #status { font-size: 0.875rem; color: #94a3b8; }
    #canvas { position: relative; width: 100%; height: calc(100vh - 64px); overflow: hidden; cursor: crosshair; }
    .cursor { position: absolute; pointer-events: none; transform: translate(-50%, -50%); transition: left 80ms linear, top 80ms linear; }
    .cursor-label { font-size: 11px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; margin-top: 4px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; margin: 0 auto; }
  </style>
</head>
<body>
  <header>
    <strong>Live Cursor Tracker</strong>
    <label>Room <input id="room" value="demo" /></label>
    <button id="connect">Connect</button>
    <span id="status">Disconnected</span>
  </header>
  <div id="canvas"></div>
  <script>
    const canvas = document.getElementById('canvas');
    const statusEl = document.getElementById('status');
    const roomInput = document.getElementById('room');
    const connectBtn = document.getElementById('connect');
    const peers = new Map();
    let ws = null;
    let selfId = null;

    function renderPeer(id, data) {
      let el = peers.get(id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'cursor';
        el.innerHTML = '<div class="dot"></div><div class="cursor-label"></div>';
        canvas.appendChild(el);
        peers.set(id, el);
      }
      el.style.left = data.x + 'px';
      el.style.top = data.y + 'px';
      el.querySelector('.dot').style.background = data.color;
      el.querySelector('.cursor-label').textContent = data.name || id.slice(0, 6);
      el.querySelector('.cursor-label').style.background = data.color;
    }

    function removePeer(id) {
      const el = peers.get(id);
      if (el) { el.remove(); peers.delete(id); }
    }

    function connect() {
      if (ws) ws.close();
      const room = roomInput.value.trim() || 'demo';
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(protocol + '//' + location.host + '/ws/' + encodeURIComponent(room));
      ws.onopen = () => { statusEl.textContent = 'Connected to room: ' + room; };
      ws.onclose = () => { statusEl.textContent = 'Disconnected'; };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'join') {
          if (!selfId) selfId = msg.id;
          renderPeer(msg.id, { x: 40, y: 40, color: msg.color, name: msg.name });
        } else if (msg.type === 'cursor') {
          renderPeer(msg.id, msg);
        } else if (msg.type === 'leave') {
          removePeer(msg.id);
        }
      };
      canvas.onmousemove = (e) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const rect = canvas.getBoundingClientRect();
        ws.send(JSON.stringify({ x: e.clientX - rect.left, y: e.clientY - rect.top }));
      };
    }

    connectBtn.onclick = connect;
    connect();
  </script>
</body>
</html>`;
