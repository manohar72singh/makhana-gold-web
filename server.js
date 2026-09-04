// Hostinger Node.js hosting entry point.
// hPanel's Node.js app manager needs a plain JS "startup file" it can run
// with `node server.js` — it can't run an npm script directly. Requires
// `npm run build` to have completed first. Local dev/testing still use
// `next dev` / `next start` as usual; this file is only for Hostinger.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);

// Next.js sometimes needs to fetch its own server internally (e.g. to
// forward a Server Action redirect). Without this, it derives its own
// public HTTPS domain and calls back out to itself over the internet,
// which is unreliable on shared hosting. Pointing it at loopback instead
// keeps that internal call local and reliable.
process.env.__NEXT_PRIVATE_ORIGIN = `http://127.0.0.1:${port}`;

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
