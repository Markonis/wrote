import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// Static files
app.use(
  "/*",
  serveStatic({ root: "./v2" }),
);

Deno.serve({ port: 4000 }, app.fetch);
