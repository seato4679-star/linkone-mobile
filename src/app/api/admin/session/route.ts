import { NextResponse } from "next/server";
import {
  createSession,
  passwordMatches,
  sessionCookie,
} from "@/lib/server/auth";
import {
  apiError,
  HttpError,
  rateLimit,
  readJson,
  requireSameOrigin,
} from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    rateLimit(request, "login", 5);
    const body = await readJson(request);
    const password =
      body && typeof body === "object" && "password" in body
        ? body.password
        : undefined;
    if (typeof password !== "string" || !passwordMatches(password))
      throw new HttpError(401, "パスワードが正しくありません。");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie, createSession(), {
      httpOnly: true,
      secure:
        !!process.env.VERCEL || new URL(request.url).protocol === "https:",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie, "", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
