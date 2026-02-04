import { serveDir } from "@std/http/file-server";

const PORT = 8000;

function printResults(results) {
  console.log("");
  let passed = 0;
  for (const { name, success, details } of results) {
    if (success) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name}`);
      console.log(details);
    }
  }
  console.log(`\nResult: \n${passed}/${results.length} passed\n`);
  return passed === results.length;
}

Deno.serve({ port: PORT }, async (req) => {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/results") {
    const results = await req.json();
    const allPassed = printResults(results);
    setTimeout(() => Deno.exit(allPassed ? 0 : 1), 0);
    return new Response("OK");
  }

  const response = await serveDir(req, { quiet: true });

  // Prevent caching of static files
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
});

// Open browser
const opener = Deno.build.os === "darwin" ? "open" : Deno.build.os === "windows" ? "start" : "xdg-open";
new Deno.Command(opener, { args: [`http://localhost:${PORT}/tests/index.html`] }).spawn();
