// Hostinger Node.js hosting entry point.
// hPanel's Node.js app manager needs a plain JS "startup file" it can run
// with `node server.js` — it can't run an npm script directly. Requires
// `npm run build` to have completed first. Local dev/testing still use
// `next dev` / `next start` as usual; this file is only for Hostinger.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
