import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sessionSecret } from "./auth";

export const receiptCookie = "linkone_receipt";
export const receiptLifetime = 60 * 60;

// A receipt proves a successful submission in this browser, without exposing PII.
export function createReceipt(
  id: string,
  expires = Date.now() + receiptLifetime * 1000,
) {
  const payload = `${id}.${expires}`;
  const signature = createHmac("sha256", sessionSecret())
    .update(`receipt:${payload}`)
    .digest("hex");
  return `${payload}.${signature}`;
}

export async function hasReceipt(id: string) {
  const token = (await cookies()).get(receiptCookie)?.value;
  if (!token) return false;
  const parts = token.split(".");
  const [receiptId, expires, signature] = parts;
  if (
    parts.length !== 3 ||
    receiptId !== id ||
    !/^\d{13}$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(signature) ||
    Number(expires) <= Date.now()
  )
    return false;
  const expected = createReceipt(id, Number(expires));
  return (
    token.length === expected.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}
