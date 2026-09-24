import { estimate, getPlan, yen } from "@/lib/plans";
import type { Selection } from "./plan-options";
import type { ReactNode } from "react";
export function PriceSummary({
  selection,
  children,
}: {
  selection: Selection;
  children?: ReactNode;
}) {
  const price = estimate(
    selection.plan,
    selection.call,
    selection.support,
    selection.campaign,
  );
  const plan = getPlan(selection.plan)!;
  return (
    <aside className="price-summary">
      <span className="eyebrow">YOUR PLAN</span>
      <h2>選択中のプラン・お見積り</h2>
      <div className="summary-plan">
        <strong>
          {plan.data}
          <small>GB</small>
        </strong>
        <span>{plan.name}</span>
      </div>
      <dl className="price-lines">
        <div>
          <dt>基本料金</dt>
          <dd>{yen(plan.price)}円</dd>
        </div>
        <div>
          <dt>通話オプション</dt>
          <dd>{yen(price.call)}円</dd>
        </div>
        <div>
          <dt>あんしんサポート</dt>
          <dd>{yen(price.support)}円</dd>
        </div>
        {price.discount > 0 && (
          <div className="discount">
            <dt>キャンペーン割引</dt>
            <dd>−{yen(price.discount)}円</dd>
          </div>
        )}
      </dl>
      <div className="summary-total" aria-live="polite">
        <span>{price.discount ? "はじめの3か月" : "月額料金"}</span>
        <p>
          {yen(price.initial)}
          <small>円 / 月</small>
        </p>
        <span>
          税込
          {price.discount ? ` · 4か月目以降 ${yen(price.regular)}円 / 月` : ""}
        </span>
      </div>
      {children}
      <p className="fineprint">
        端末代・従量通話料・各種法定料金は含みません。実際の契約・請求は発生しません。
      </p>
    </aside>
  );
}
