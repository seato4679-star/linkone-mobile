"use client";
import Link from "next/link";
import { useState } from "react";
import { PlanOptions, type Selection } from "./plan-options";
import { PriceSummary } from "./price-summary";
export function Simulator({ initial }: { initial: Selection }) {
  const [selection, setSelection] = useState(initial);
  const query = new URLSearchParams({
    plan: selection.plan,
    call: selection.call,
    support: selection.support ? "1" : "0",
    campaign: selection.campaign ? "1" : "0",
  });
  return (
    <div className="form-layout">
      <div className="card form-card">
        <PlanOptions selection={selection} onChange={setSelection} />
      </div>
      <PriceSummary selection={selection}>
        <Link href={`/apply?${query}`} className="button primary full">
          この内容で申し込む ↗
        </Link>
        <p className="summary-note">選んだプラン・オプションを引き継ぎます</p>
      </PriceSummary>
    </div>
  );
}
