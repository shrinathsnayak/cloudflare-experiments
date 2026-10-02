/**
 * Reveal page for GET /s/:id. The key lives only in the URL fragment (never sent to the server),
 * and reveal requires a button click so link-preview bots that GET the page don't burn the secret.
 * `id` must already be validated (base64url only) before it is interpolated.
 */
export function renderRevealPage(id: string, nonce: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>One-time secret</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; color: #1a1a1a; }
  button { font: inherit; padding: .6rem 1.2rem; border: 0; border-radius: .4rem; background: #f6821f; color: #fff; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; }
  pre { white-space: pre-wrap; word-break: break-word; background: #f4f4f4; padding: 1rem; border-radius: .4rem; }
  .muted { color: #666; }
</style>
</head>
<body>
<h1>One-time secret</h1>
<p id="status" class="muted">Checking…</p>
<button id="reveal" disabled>Reveal secret</button>
<pre id="output" hidden></pre>
<script nonce="${nonce}">
  const id = ${JSON.stringify(id)};
  const key = location.hash.slice(1);
  const status = document.getElementById("status");
  const button = document.getElementById("reveal");
  const output = document.getElementById("output");

  async function check() {
    if (!key) { status.textContent = "This link is missing its decryption key."; return; }
    const res = await fetch("/secrets/" + id);
    const data = await res.json();
    if (!data.exists) { status.textContent = "This secret was already viewed or has expired."; return; }
    status.textContent = "This secret can be viewed once. Expires " + new Date(data.expiresAt).toLocaleString() + ".";
    button.disabled = false;
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    const res = await fetch("/secrets/" + id + "/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (!res.ok) { status.textContent = data.error; return; }
    history.replaceState(null, "", location.pathname);
    status.textContent = "Revealed and deleted from the server. Copy it now.";
    output.textContent = data.secret;
    output.hidden = false;
    button.hidden = true;
  });

  check().catch(() => { status.textContent = "Could not load secret status."; });
</script>
</body>
</html>`;
}
