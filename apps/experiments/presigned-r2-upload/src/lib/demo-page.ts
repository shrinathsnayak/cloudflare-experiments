export const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Presigned R2 Upload</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
    label { display: block; margin: 1rem 0 0.25rem; }
    input, select, button { width: 100%; padding: 0.5rem; }
    pre { background: #f1f5f9; padding: 1rem; overflow: auto; }
  </style>
</head>
<body>
  <h1>Direct R2 Upload</h1>
  <p>Get a presigned URL, then PUT the file directly to R2 from your browser.</p>
  <label>Filename <input id="filename" value="demo.png" /></label>
  <label>Content-Type
    <select id="contentType">
      <option value="image/png">image/png</option>
      <option value="image/jpeg">image/jpeg</option>
      <option value="text/plain">text/plain</option>
      <option value="application/pdf">application/pdf</option>
    </select>
  </label>
  <label>File <input id="file" type="file" /></label>
  <button id="upload">Upload via presigned URL</button>
  <pre id="log"></pre>
  <script>
    const log = document.getElementById('log');
    document.getElementById('upload').onclick = async () => {
      const filename = document.getElementById('filename').value;
      const contentType = document.getElementById('contentType').value;
      const file = document.getElementById('file').files[0];
      if (!file) { log.textContent = 'Choose a file first'; return; }
      const presign = await fetch('/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType })
      }).then(r => r.json());
      if (presign.error) { log.textContent = JSON.stringify(presign, null, 2); return; }
      const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
      log.textContent = JSON.stringify({ presign, putStatus: put.status }, null, 2);
    };
  </script>
</body>
</html>`;
