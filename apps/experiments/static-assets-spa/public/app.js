fetch("/api/hello")
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => {
    const el = document.getElementById("result");
    if (el) {
      el.textContent = JSON.stringify(data, null, 2);
    }
  })
  .catch((err) => {
    const el = document.getElementById("result");
    if (el) {
      el.textContent = err instanceof Error ? err.message : String(err);
    }
  });
