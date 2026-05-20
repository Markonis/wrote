import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// Static files
app.use(
  "/*",
  serveStatic({
    root: "./src",
    // rewriteRequestPath: (path) => path.replace(/^\/client/, ""),
  }),
);

Deno.serve({ port: 4000 }, app.fetch);
