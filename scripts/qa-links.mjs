// Read-only link verification against the already running local site.
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3000";
const pages = [
  "/",
  "/campaign",
  "/plans",
  "/simulator",
  "/apply",
  "/complete",
  "/privacy",
  "/admin",
];
const targets = new Set(pages);
for (const page of pages) {
  const html = await (await fetch(base + page)).text();
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    targets.add(href);
  }
}
for (const target of targets) {
  const response = await fetch(base + target);
  assert.equal(response.status, 200, `Broken link: ${target}`);
}
console.log(
  `PASS: ${targets.size} unique internal link destinations returned HTTP 200`,
);
