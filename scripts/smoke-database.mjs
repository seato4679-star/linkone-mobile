// Explicit real-DB test: creates one fictional application and leaves it for inspection.
import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";

loadEnvFile(".env.local");
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const baseUrl = new URL(base);
assert.ok(
  ["127.0.0.1", "localhost"].includes(baseUrl.hostname) &&
    process.env.DEMO_MODE === "false",
  "実DBテストはlocalhostとDEMO_MODE=falseの環境専用です。",
);
const databaseUrl = process.env.SUPABASE_URL;
const databaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(databaseUrl && databaseKey, "Supabaseの接続設定が必要です。");
assert.ok(process.env.ADMIN_PASSWORD, "管理パスワードが必要です。");
const headers = { "Content-Type": "application/json", Origin: baseUrl.origin };
let checks = 0;
function check(condition, label) {
  assert.ok(condition, label);
  checks++;
  console.log(`PASS ${label}`);
}
const payload = {
  name: "DB接続確認 テスト",
  email: "database-test@example.com",
  phone: "09000000000",
  plan: "smart",
  call_option: "five",
  support: true,
  campaign: true,
  consent: true,
};

// These headers are used only by this local test process, never a browser.
const databaseHeaders = { apikey: databaseKey };
if (/^eyJ[^.]+\.[^.]+\.[^.]+$/.test(databaseKey)) {
  databaseHeaders.Authorization = `Bearer ${databaseKey}`;
}
async function savedRow(id) {
  const endpoint = new URL(`${databaseUrl.replace(/\/$/, "")}/rest/v1/applications`);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("select", "id,name,email,phone,plan,call_option,support,campaign,consent,status");
  const response = await fetch(endpoint, {
    headers: databaseHeaders,
    signal: AbortSignal.timeout(10_000),
    redirect: "error",
  });
  assert.ok(response.ok, `DB確認に失敗しました（HTTP ${response.status}）。`);
  const rows = await response.json();
  assert.equal(rows.length, 1, "受付IDに対応する申込は1件です。");
  return rows[0];
}

const invalid = await fetch(base + "/api/applications", {
  method: "POST", headers, body: JSON.stringify({}),
});
check(invalid.status === 400, "invalid input rejected");
const created = await fetch(base + "/api/applications", {
  method: "POST", headers, body: JSON.stringify(payload),
});
check(created.status === 201, "application API returns 201");
const receipt = await created.json();
check(typeof receipt.id === "string" && /^[0-9a-f-]{36}$/i.test(receipt.id), "receipt ID returned");
console.log(`Test receipt: ${receipt.id}`);
const row = await savedRow(receipt.id);
check(Object.entries(payload).every(([key, value]) => row[key] === value) && row.status === "pending", "fields and initial status saved in Supabase");
const receiptCookie = created.headers.get("set-cookie")?.split(";")[0];
check(!!receiptCookie, "signed receipt cookie returned");
const complete = await fetch(base + `/complete?id=${receipt.id}`, { headers: { Cookie: receiptCookie } });
const completeHtml = await complete.text();
const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(completeHtml)?.[1].replace(/<[^>]*>/g, "") ?? "";
check(heading.includes("お申し込みを受け付けました"), "completion page displays saved receipt");
const anonymous = await fetch(base + `/api/applications/${receipt.id}`, {
  method: "PATCH", headers, body: JSON.stringify({ status: "completed" }),
});
check(anonymous.status === 401, "anonymous update denied");
const login = await fetch(base + "/api/admin/session", {
  method: "POST", headers, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
});
check(login.status === 200, "admin login successful");
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie, "管理Cookieが必要です。");
const dashboard = await fetch(base + "/admin", { headers: { Cookie: cookie } });
check((await dashboard.text()).includes(receipt.id), "saved application appears in dashboard");
const detail = await fetch(base + `/admin/applications/${receipt.id}`, { headers: { Cookie: cookie } });
check((await detail.text()).includes(payload.email), "saved contact information appears in authenticated detail");
for (const status of ["reviewing", "completed"]) {
  const response = await fetch(base + `/api/applications/${receipt.id}`, {
    method: "PATCH", headers: { ...headers, Cookie: cookie }, body: JSON.stringify({ status }),
  });
  check(response.status === 200, `status API accepts ${status}`);
  check((await savedRow(receipt.id)).status === status, `${status} persists in Supabase`);
}
const logout = await fetch(base + "/api/admin/session", {
  method: "DELETE", headers: { ...headers, Cookie: cookie },
});
check(logout.status === 200, "admin logout successful");
console.log(`${checks} checks passed. 架空のテスト申込1件をDBに残しています。`);
