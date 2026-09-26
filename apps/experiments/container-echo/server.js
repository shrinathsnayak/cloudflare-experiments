const http = require("http");

http
  .createServer((req, res) => {
    let d = "";
    req.on("data", (c) => {
      d += c;
    });
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ echo: d, port: 8080 }));
    });
  })
  .listen(8080);
