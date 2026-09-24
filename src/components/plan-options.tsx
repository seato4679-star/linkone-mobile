"use client";
import { calls, plans, type PlanId, type CallId, yen } from "@/lib/plans";
import type { FieldErrors } from "@/lib/validation";

export type Selection = {
  plan: PlanId;
  call: CallId;
  support: boolean;
  campaign: boolean;
};
export function PlanOptions({
  selection,
  onChange,
  errors,
}: {
  selection: Selection;
  onChange: (selection: Selection) => void;
  errors?: Pick<FieldErrors, "plan" | "call_option" | "support" | "campaign">;
}) {
  return (
    <>
      <fieldset>
        <legend>
          <span className="step-number">01</span>データ容量を選ぶ
        </legend>
        <div className="choice-grid">
          {plans.map((plan) => (
            <label
              className={`choice ${selection.plan === plan.id ? "selected" : ""}`}
              key={plan.id}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selection.plan === plan.id}
                aria-describedby={errors?.plan ? "plan-error" : undefined}
                onChange={() =>
                  onChange({
                    ...selection,
                    plan: plan.id,
                    campaign: plan.id === "smart" && selection.campaign,
                  })
                }
              />
              <strong>
                {plan.data}
                <small>GB</small>
              </strong>
              <span>{plan.name}</span>
              <span>{yen(plan.price)}円 / 月</span>
            </label>
          ))}
        </div>
        <span id="plan-error" className="field-error" role="alert">
          {errors?.plan}
        </span>
      </fieldset>
      <fieldset>
        <legend>
          <span className="step-number">02</span>通話の使い方を選ぶ
        </legend>
        <div className="stack">
          {calls.map((call) => (
            <label
              className={`radio-row ${selection.call === call.id ? "selected" : ""}`}
              key={call.id}
            >
              <input
                type="radio"
                name="call_option"
                value={call.id}
                checked={selection.call === call.id}
                aria-describedby={
                  errors?.call_option ? "call-option-error" : undefined
                }
                onChange={() => onChange({ ...selection, call: call.id })}
              />
              <span>
                <strong>{call.name}</strong>
                <small>{call.detail}</small>
              </span>
              <b>+{yen(call.price)}円</b>
            </label>
          ))}
        </div>
        <span id="call-option-error" className="field-error" role="alert">
          {errors?.call_option}
        </span>
      </fieldset>
      <fieldset>
        <legend>
          <span className="step-number">03</span>必要なオプションを追加
        </legend>
        <label className="radio-row">
          <input
            type="checkbox"
            name="support"
            checked={selection.support}
            aria-invalid={!!errors?.support}
            aria-describedby={errors?.support ? "support-error" : undefined}
            onChange={(event) =>
              onChange({ ...selection, support: event.target.checked })
            }
          />
          <span>
            <strong>あんしんサポート</strong>
            <small>初期設定や操作を気軽に相談</small>
          </span>
          <b>+330円</b>
        </label>
        <span id="support-error" className="field-error" role="alert">
          {errors?.support}
        </span>
      </fieldset>
      {selection.plan === "smart" && (
        <>
          <label className="campaign-check">
            <input
              type="checkbox"
              name="campaign"
              checked={selection.campaign}
              aria-invalid={!!errors?.campaign}
              aria-describedby={
                errors?.campaign ? "campaign-error" : undefined
              }
              onChange={(event) =>
                onChange({ ...selection, campaign: event.target.checked })
              }
            />
            <span>
              <strong>ウェルカムキャンペーンを利用する</strong>
              <small>基本料金が3か月間1,000円OFF</small>
            </span>
          </label>
          <span id="campaign-error" className="field-error" role="alert">
            {errors?.campaign}
          </span>
        </>
      )}
    </>
  );
}
