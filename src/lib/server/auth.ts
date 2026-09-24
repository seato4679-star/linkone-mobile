import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isDemoMode } from "./applications";

export const sessionCookie = "linkone_admin";
export function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("SESSION_SECRET must have at least 32 characters");
  if (
    !isDemoMode() &&
    value === "local-development-only-change-this-secret-2026"
  )
    throw new Error("Replace the demo SESSION_SECRET outside local demo mode");
  return value;
}
export function passwordMatches(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12)
    throw new Error("ADMIN_PASSWORD must have at least 12 characters");
  if (!isDemoMode() && expected === "linkone-local-demo")
    throw new Error("Replace the demo ADMIN_PASSWORD outside local demo mode");
  const hash = (value: string) =>
    createHmac("sha256", sessionSecret()).update(value).digest();
  return timingSafeEqual(hash(password), hash(expected));
}
export function createSession() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const signature = createHmac("sha256", sessionSecret())
    .update(expires)
    .digest("hex");
  return `${expires}.${signature}`;
}
export async function isAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, signature] = token.split(".");
  if (
    !/^\d{13}$/.test(expires ?? "") ||
    !/^[a-f0-9]{64}$/.test(signature ?? "") ||
    Number(expires) <= Date.now()
  )
    return false;
  const expected = createHmac("sha256", sessionSecret())
    .update(expires)
    .digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
