import "server-only";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js may normalize request.url to localhost behind its server.
  // The Host header retains the host and port actually requested by the browser.
  const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get("host")}`;
  if (!origin || origin !== expectedOrigin)
    throw new HttpError(403, "同じサイトから操作してください。");
}
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "JSON形式で送信してください。");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "入力データがありません。");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new HttpError(413, "入力データが大きすぎます。");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "JSON形式が正しくありません。");
  }
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  // Do not log request bodies or credentials.
  console.error(
    "LinkOne server operation failed:",
    error instanceof Error ? error.message : "unknown error",
  );
  return Response.json(
    { error: "処理できませんでした。時間をおいて再度お試しください。" },
    { status: 503 },
  );
}

// Best-effort single-instance limit; use a shared limiter/WAF before public operation.
const attempts = new Map<string, { count: number; expires: number }>();
export function rateLimit(request: Request, scope: string, max: number) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.expires < now) attempts.delete(key);
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const key = `${scope}:${ip}`;
  const entry = attempts.get(key) ?? { count: 0, expires: now + 60_000 };
  if (entry.count >= max)
    throw new HttpError(
      429,
      "操作が多すぎます。1分ほど待って再度お試しください。",
    );
  entry.count += 1;
  attempts.set(key, entry);
}
