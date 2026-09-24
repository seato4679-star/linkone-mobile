"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlanOptions, type Selection } from "./plan-options";
import { PriceSummary } from "./price-summary";
import {
  applicationSubmitErrorMessage,
  isUuid,
  validateApplication,
  type FieldErrors,
} from "@/lib/validation";

export function ApplicationForm({ initial }: { initial: Selection }) {
  const router = useRouter();
  const [selection, setSelection] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setMessage("");
    const form = new FormData(event.currentTarget);
    const result = validateApplication({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      plan: selection.plan,
      call_option: selection.call,
      support: selection.support,
      campaign: selection.campaign,
      consent: form.get("consent") === "on",
    });
    setErrors(result.errors);
    if (!result.data) {
      setMessage("入力内容をご確認ください。");
      const firstField = Object.keys(result.errors)[0];
      event.currentTarget
        .querySelector<HTMLInputElement>(`[name="${firstField}"]`)
        ?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setErrors(body?.errors ?? {});
        throw new Error(
          applicationSubmitErrorMessage(response.status, body?.error),
        );
      }
      if (typeof body?.id !== "string" || !isUuid(body.id))
        throw new Error(
          "受付結果を確認できませんでした。再送する前に、管理担当者に受付状況をご確認ください。",
        );
      // The response contains only a receipt ID, never the personal information.
      router.push(`/complete?id=${encodeURIComponent(body.id)}`);
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "通信が切れたため受付結果を確認できません。再送する前に、管理担当者に受付状況をご確認ください。"
          : error instanceof Error
            ? error.message
            : "通信に失敗しました。接続をご確認ください。",
      );
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
      <fieldset disabled={pending} className="form-layout form-fields">
        <legend className="sr-only">申込情報</legend>
        <div className="stack">
          <section className="card form-card">
            <h2 className="form-title">お申し込み内容</h2>
            <PlanOptions
              selection={selection}
              onChange={setSelection}
              errors={errors}
            />
          </section>
          <section className="card form-card">
            <h2 className="form-title">お客さま情報</h2>
            <p className="notice compact">
              デモ用の架空の情報を入力してください。
            </p>
            {[
              {
                key: "name",
                label: "氏名",
                placeholder: "デモ 太郎",
                type: "text",
                auto: "name",
                max: 80,
              },
              {
                key: "email",
                label: "メールアドレス",
                placeholder: "demo@example.com",
                type: "email",
                auto: "email",
                max: 254,
              },
              {
                key: "phone",
                label: "電話番号",
                placeholder: "09000000000",
                type: "tel",
                auto: "tel",
                max: 20,
              },
            ].map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={field.key}>
                  {field.label}
                  <span className="required">必須</span>
                </label>
                <input
                  id={field.key}
                  name={field.key}
                  type={field.type}
                  autoComplete={field.auto}
                  placeholder={field.placeholder}
                  maxLength={field.max}
                  required
                  aria-invalid={!!errors[field.key as keyof FieldErrors]}
                  aria-describedby={
                    errors[field.key as keyof FieldErrors]
                      ? `${field.key}-error`
                      : undefined
                  }
                />
                <span id={`${field.key}-error`} className="field-error">
                  {errors[field.key as keyof FieldErrors]}
                </span>
              </div>
            ))}
            <label className="consent">
              <input
                type="checkbox"
                name="consent"
                required
                aria-invalid={!!errors.consent}
                aria-describedby="consent-error"
              />
              <span>
                <Link href="/privacy" target="_blank" className="text-link">
                  デモ利用と個人情報の取り扱い（別タブ）
                </Link>
                を確認し、架空の情報で申し込みます。
              </span>
            </label>
            <span id="consent-error" className="field-error">
              {errors.consent}
            </span>
            {message && (
              <div className="error-message" role="alert">
                {message}
              </div>
            )}
          </section>
        </div>
        <PriceSummary selection={selection}>
          <button
            className="button primary full"
            type="submit"
            disabled={pending}
          >
            {pending ? "送信しています…" : "この内容で申し込む →"}
          </button>
          <p className="summary-note">実際の契約・請求は発生しません</p>
          {pending && (
            <p role="status">受付完了までこの画面でお待ちください。</p>
          )}
        </PriceSummary>
      </fieldset>
    </form>
  );
}
