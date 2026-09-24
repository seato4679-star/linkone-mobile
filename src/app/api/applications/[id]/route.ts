import { isStatus, isUuid } from "@/lib/validation";
import { updateStatus } from "@/lib/server/applications";
import { isAdmin } from "@/lib/server/auth";
import {
  apiError,
  HttpError,
  readJson,
  requireSameOrigin,
} from "@/lib/server/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireSameOrigin(request);
    if (!(await isAdmin())) throw new HttpError(401, "ログインしてください。");
    const { id } = await params;
    if (!isUuid(id)) throw new HttpError(400, "受付番号が不正です。");
    const body = await readJson(request);
    const status =
      body && typeof body === "object" && "status" in body
        ? body.status
        : undefined;
    if (!isStatus(status)) throw new HttpError(400, "ステータスが不正です。");
    const application = await updateStatus(id, status);
    if (!application) throw new HttpError(404, "申込が見つかりません。");
    return Response.json({ application });
  } catch (error) {
    return apiError(error);
  }
}
