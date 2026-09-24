import { validateApplication } from "@/lib/validation";
import { NextResponse } from "next/server";
import { sessionSecret } from "@/lib/server/auth";
import {
  createReceipt,
  receiptCookie,
  receiptLifetime,
} from "@/lib/server/receipt";
import { createApplication } from "@/lib/server/applications";
import {
  apiError,
  rateLimit,
  readJson,
  requireSameOrigin,
} from "@/lib/server/http";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    rateLimit(request, "apply", 10);
    const result = validateApplication(await readJson(request));
    if (!result.data)
      return Response.json(
        { error: "入力内容をご確認ください。", errors: result.errors },
        { status: 400 },
      );
    // Validate signing configuration before writing, so misconfiguration cannot
    // save a record and then fail while creating its receipt.
    sessionSecret();
    const application = await createApplication(result.data);
    const response = NextResponse.json({ id: application.id }, { status: 201 });
    response.cookies.set(receiptCookie, createReceipt(application.id), {
      httpOnly: true,
      sameSite: "lax",
      secure:
        !!process.env.VERCEL || new URL(request.url).protocol === "https:",
      path: "/complete",
      maxAge: receiptLifetime,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
