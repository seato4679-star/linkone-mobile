import {
  calls,
  plans,
  statuses,
  type CallId,
  type PlanId,
  type Status,
} from "./plans.ts";

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  plan: PlanId;
  call_option: CallId;
  support: boolean;
  campaign: boolean;
  consent: true;
};
export type Application = ApplicationInput & {
  id: string;
  status: Status;
  created_at: string;
};
export type FieldErrors = Partial<Record<keyof ApplicationInput, string>>;

export function applicationSubmitErrorMessage(status: number, error: unknown) {
  if (status === 503)
    return "受付済みの可能性があります。再送する前に管理担当者にご確認ください。";
  return typeof error === "string"
    ? error
    : "受付結果を確認できませんでした。再送する前に、管理担当者に受付状況をご確認ください。";
}

// The same rules run in the browser for feedback and on the server for trust.
export function validateApplication(raw: unknown): {
  data?: ApplicationInput;
  errors: FieldErrors;
} {
  const value =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const text = (key: string) =>
    typeof value[key] === "string" ? (value[key] as string).trim() : "";
  const name = text("name");
  const email = text("email").toLowerCase();
  const phone = text("phone").replace(/[-\s]/g, "");
  const plan = text("plan");
  const call = text("call_option");
  const errors: FieldErrors = {};
  if (
    [...name].length < 2 ||
    [...name].length > 80 ||
    /[\u0000-\u001f<>]/.test(name)
  )
    errors.name = "氏名は2〜80文字で入力してください。";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "有効なメールアドレスを入力してください。";
  if (!/^0\d{9,10}$/.test(phone))
    errors.phone = "電話番号は0から始まる10〜11桁で入力してください。";
  if (!plans.some((p) => p.id === plan))
    errors.plan = "プランを選択してください。";
  if (!calls.some((c) => c.id === call))
    errors.call_option = "通話オプションを選択してください。";
  if (typeof value.support !== "boolean")
    errors.support = "サポートの選択が不正です。";
  if (
    typeof value.campaign !== "boolean" ||
    (value.campaign && plan !== "smart")
  )
    errors.campaign = "キャンペーンはスマートプランのみ対象です。";
  if (value.consent !== true)
    errors.consent = "デモの注意事項と個人情報の取り扱いをご確認ください。";
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    data: {
      name,
      email,
      phone,
      plan: plan as PlanId,
      call_option: call as CallId,
      support: value.support as boolean,
      campaign: value.campaign as boolean,
      consent: true,
    },
  };
}
export function isStatus(value: unknown): value is Status {
  return statuses.some((s) => s === value);
}
export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
