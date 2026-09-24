// Run against a local demo server only. This intentionally creates one test record.
import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";
loadEnvFile(".env.local");
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
if (
  !["127.0.0.1", "localhost"].includes(new URL(base).hostname) ||
  process.env.DEMO_MODE !== "true"
) {
  throw new Error("Smoke tests require localhost and DEMO_MODE=true");
}
let checks = 0;
const check = (condition, label) => {
  assert.ok(condition, label);
  checks++;
  console.log(`PASS ${label}`);
};
const jsonHeaders = { "Content-Type": "application/json", Origin: base };
// Compare the visible heading, allowing spans used for responsive line breaks.
const hasSuccessHeading = (html) =>
  /<h1\b[^>]*>([\s\S]*?)<\/h1>/
    .exec(html)?.[1]
    .replace(/<[^>]*>/g, "")
    .includes("お申し込みを受け付けました。") ?? false;
const payload = {
  name: "自動テスト 太郎",
  email: "smoke@example.com",
  phone: "09000000000",
  plan: "smart",
  call_option: "five",
  support: true,
  campaign: true,
  consent: true,
};

for (const page of [
  "/",
  "/campaign",
  "/plans",
  "/simulator",
  "/apply",
  "/complete",
  "/privacy",
  "/admin",
]) {
  const response = await fetch(base + page);
  check(response.status === 200, `${page} renders`);
  const html = await response.text();
  check(
    !html.includes(process.env.SESSION_SECRET),
    `${page} does not expose session secret`,
  );
}
check(
  (await fetch(base + "/not-a-page")).status === 404,
  "unknown page returns 404",
);
check(
  (await fetch(base + "/api/applications")).status === 405,
  "application list API is not exposed",
);
check(
  (
    await fetch(
      base + "/api/applications/734ed971-7a1b-4e31-94f2-a227d50cd662",
      {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ status: "completed" }),
      },
    )
  ).status === 401,
  "anonymous update denied",
);
check(
  (
    await fetch(base + "/api/applications", {
      method: "POST",
      headers: { ...jsonHeaders, Origin: "https://elsewhere.example" },
      body: JSON.stringify(payload),
    })
  ).status === 403,
  "cross-origin mutation denied",
);
check(
  (
    await fetch(base + "/api/applications", {
      method: "POST",
      headers: jsonHeaders,
      body: "{",
    })
  ).status === 400,
  "malformed JSON rejected",
);
check(
  (
    await fetch(base + "/api/applications", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({}),
    })
  ).status === 400,
  "invalid fields rejected",
);
check(
  (
    await fetch(base + "/api/applications", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ extra: "x".repeat(9000) }),
    })
  ).status === 413,
  "oversized payload rejected",
);
check(
  (
    await fetch(base + "/api/applications", {
      method: "POST",
      headers: { Origin: base, "Content-Type": "text/plain" },
      body: "invalid",
    })
  ).status === 415,
  "wrong content type rejected",
);
const created = await fetch(base + "/api/applications", {
  method: "POST",
  headers: jsonHeaders,
  body: JSON.stringify({ ...payload, status: "completed" }),
});
check(created.status === 201, "application created");
const receipt = await created.json();
const receiptSetCookie = created.headers.get("set-cookie");
check(
  receiptSetCookie?.includes("HttpOnly") &&
    receiptSetCookie.includes("Path=/complete"),
  "receipt is stored in an HttpOnly scoped cookie",
);
const receiptAuth = receiptSetCookie.split(";")[0];
const completeUrl = base + `/complete?id=${receipt.id}`;
const completedHtml = await (
  await fetch(completeUrl, { headers: { Cookie: receiptAuth } })
).text();
check(
  hasSuccessHeading(completedHtml),
  "signed receipt displays successful completion",
);
const unsignedHtml = await (await fetch(completeUrl)).text();
check(
  !hasSuccessHeading(unsignedHtml) &&
    unsignedHtml.includes("受付情報を表示できません"),
  "URL alone cannot claim successful completion",
);
const tamperedHtml = await (
  await fetch(completeUrl, { headers: { Cookie: receiptAuth + "x" } })
).text();
check(
  !hasSuccessHeading(tamperedHtml),
  "tampered receipt rejected",
);
const wrongReceiptHtml = await (
  await fetch(base + "/complete?id=734ed971-7a1b-4e31-94f2-a227d50cd662", {
    headers: { Cookie: receiptAuth },
  })
).text();
check(
  !hasSuccessHeading(wrongReceiptHtml),
  "receipt for another application rejected",
);
check(
  typeof receipt.id === "string" && Object.keys(receipt).length === 1,
  "public response contains receipt ID only",
);
const unauthDetail = await fetch(base + `/admin/applications/${receipt.id}`, {
  redirect: "manual",
});
const unauthHtml = await unauthDetail.text();
// Streaming Server Components can return a meta redirect after HTTP headers.
check(
  unauthDetail.status === 307 || unauthHtml.includes('content="1;url=/admin"'),
  "anonymous detail redirected",
);
check(
  !unauthHtml.includes(payload.email) && !unauthHtml.includes(payload.name),
  "anonymous detail exposes no application data",
);
check(
  (
    await fetch(base + "/api/admin/session", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ password: "incorrect" }),
    })
  ).status === 401,
  "wrong password rejected",
);
const login = await fetch(base + "/api/admin/session", {
  method: "POST",
  headers: jsonHeaders,
  body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
});
check(login.status === 200, "admin login successful");
const setCookie = login.headers.get("set-cookie");
check(
  setCookie.includes("HttpOnly") && /SameSite=strict/i.test(setCookie),
  "session cookie has protective flags",
);
const cookie = setCookie.split(";")[0];
const authHeaders = { ...jsonHeaders, Cookie: cookie };
const detailHtml = await (
  await fetch(base + `/admin/applications/${receipt.id}`, {
    headers: { Cookie: cookie },
  })
).text();
check(
  detailHtml.includes("確認待ち") &&
    detailHtml.includes("5分かけ放題") &&
    detailHtml.includes("あんしんサポート"),
  "saved options and server-owned status are correct",
);
check(
  detailHtml.includes(payload.name) &&
    detailHtml.includes(payload.email) &&
    detailHtml.includes(payload.phone) &&
    detailHtml.includes("スマート / 20GB") &&
    detailHtml.includes("同意済み"),
  "contact fields, plan and consent persist in the authenticated detail",
);
check(
  (
    await fetch(base + `/admin/applications/${receipt.id}`, {
      headers: { Cookie: cookie },
    })
  ).status === 200,
  "authenticated detail renders",
);
check(
  (await fetch(base + "/admin", { headers: { Cookie: cookie } })).status ===
    200,
  "authenticated dashboard renders",
);
check(
  (
    await fetch(base + `/api/applications/${receipt.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "deleted" }),
    })
  ).status === 400,
  "invalid status rejected",
);
check(
  (
    await fetch(base + "/api/applications/not-a-uuid", {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "completed" }),
    })
  ).status === 400,
  "invalid route ID rejected",
);
check(
  (
    await fetch(
      base + "/api/applications/734ed971-7a1b-4e31-94f2-a227d50cd662",
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "completed" }),
      },
    )
  ).status === 404,
  "missing application returns 404",
);
for (const status of ["reviewing", "completed"]) {
  const update = await fetch(base + `/api/applications/${receipt.id}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status }),
  });
  check(
    update.status === 200 &&
      (await update.json()).application.status === status,
    `status changed to ${status}`,
  );
}
check(
  (
    await (
      await fetch(base + `/admin/applications/${receipt.id}`, {
        headers: { Cookie: cookie },
      })
    ).text()
  ).includes("完了"),
  "status persists in the authenticated detail",
);
check(
  (
    await fetch(base + "/api/applications", {
      headers: { Cookie: cookie + "tampered" },
    })
  ).status === 405,
  "list API remains unavailable with a tampered session",
);
check(
  (
    await fetch(base + "/api/applications", {
      headers: { Cookie: cookie + ".extra" },
    })
  ).status === 405,
  "list API remains unavailable with an extra session token segment",
);
const logout = await fetch(base + "/api/admin/session", {
  method: "DELETE",
  headers: authHeaders,
});
check(
  logout.status === 200 &&
    logout.headers.get("set-cookie").includes("Max-Age=0"),
  "logout clears cookie",
);
console.log(`\n${checks} checks passed. Demo receipt: ${receipt.id}`);
