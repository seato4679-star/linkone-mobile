// Read-only connection check. Never print credentials or application records.
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

async function checkDatabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。docs/BACKEND_SETUP.md に沿って設定してください。",
    );
  }
  let endpoint;
  try {
    endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/applications`);
  } catch {
    throw new Error("SUPABASE_URL はプロジェクトのHTTPS URLを指定してください。");
  }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
    throw new Error("SUPABASE_URL は認証情報を含まないHTTPS URLを指定してください。");
  }
  const headers = { apikey: key };
  if (/^eyJ[^.]+\.[^.]+\.[^.]+$/.test(key)) {
    // Legacy service_role JWTs also need the Authorization header.
    headers.Authorization = `Bearer ${key}`;
  } else if (!key.startsWith("sb_secret_")) {
    throw new Error("サーバー用のsecretキーを指定してください。publishable / anonキーは使用できません。");
  }
  endpoint.searchParams.set(
    "select",
    "id,name,email,phone,plan,call_option,support,campaign,consent,status,created_at",
  );
  // Check the column names and read permission without retrieving personal data.
  endpoint.searchParams.set("limit", "0");
  let response;
  try {
    response = await fetch(endpoint, {
      headers,
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
  } catch {
    throw new Error("DBへ接続できませんでした。URL・ネットワーク・Supabaseの稼働状態を確認してください。");
  }
  if (!response.ok) {
    const hint =
      response.status === 401 || response.status === 403
        ? "サーバー用キーとテーブルのアクセス権を確認してください。"
        : response.status === 400 || response.status === 404
          ? "supabase/schema.sql に従ってapplicationsテーブルを作成してください。"
          : "Supabaseの稼働状態とData API設定を確認してください。";
    throw new Error(`DB接続確認に失敗しました（HTTP ${response.status}）。${hint}`);
  }
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 0) {
    throw new Error("DBから想定外の応答が返りました。");
  }
  console.log("PASS: Supabaseへの接続、applicationsテーブル、必要な列の読み取りを確認しました。");
  console.log("この確認では申込データの読み出し・作成・変更は行いません。");
  if (process.env.DEMO_MODE === "true" && !process.env.VERCEL) {
    console.log("注意: 現在のアプリはローカルデモ保存です。DB保存に切り替えるにはDEMO_MODE=falseにし、サーバーを再起動してください。");
  }
  console.log("次に架空の情報で申込し、Supabase Table Editorと管理画面で保存・ステータス更新を確認してください。");
}

checkDatabase().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
