import Link from "next/link";
import type { ReactNode } from "react";
import { plans, yen } from "@/lib/plans";

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export function SectionHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{label}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function PageHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function PlanCards() {
  return (
    <div className="plan-grid">
      {plans.map((plan) => (
        <article
          className={`plan-card ${plan.id === "smart" ? "recommended" : ""}`}
          key={plan.id}
        >
          {plan.id === "smart" && (
            <div className="recommend-label">20GB限定キャンペーン対象</div>
          )}
          <div className="plan-top">
            <span>{plan.name}</span>
            <span className="tiny-label">LINKONE {plan.id.toUpperCase()}</span>
          </div>
          <p className="data-size">
            {plan.data}
            <span>GB</span>
          </p>
          <p className="muted">{plan.description}</p>
          <p className="price">
            <span>月額</span> {yen(plan.price)}
            <small>円</small>
          </p>
          <span className="tax">税込 / 月</span>
          <div className="plan-features">
            {plan.features.map((feature) => (
              <p key={feature}>
                <span className="check">✓</span>
                {feature}
              </p>
            ))}
            <p>
              <span className="check">✓</span>5G対応・テザリング無料
            </p>
          </div>
          <Link
            href={`/apply?plan=${plan.id}`}
            className={`button full ${plan.id === "smart" ? "primary" : "outline"}`}
          >
            このプランで申し込む <Arrow />
          </Link>
          <Link
            className="text-link plan-sim-link"
            href={`/simulator?plan=${plan.id}`}
          >
            {plan.data}GBで料金を試算 →
          </Link>
        </article>
      ))}
    </div>
  );
}
export function Cta() {
  return (
    <section className="cta-band">
      <div>
        <span className="eyebrow">YOUR NEXT CONNECTION</span>
        <h2>
          あなたらしい毎日に、
          <br />
          ちょうどいい通信を。
        </h2>
        <p>シンプルな料金で、スマホをもっと自由に。</p>
      </div>
      <div className="cta-actions">
        <Link href="/simulator" className="button lime">
          ぴったりのプランを見つける <Arrow />
        </Link>
        <Link href="/apply" className="text-link light">
          すぐに申し込む →
        </Link>
      </div>
    </section>
  );
}
export function Steps({ current }: { current: number }) {
  return (
    <ol className="steps">
      {["プランを選ぶ", "お客さま情報", "受付完了"].map((label, i) => (
        <li
          key={label}
          className={current === i + 1 ? "active" : ""}
          aria-current={current === i + 1 ? "step" : undefined}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
