import type { Metadata } from "next";
import Link from "next/link";
import { calls, yen } from "@/lib/plans";
import { Cta, PageHeading, PlanCards, SectionHeading } from "@/components/ui";
export const metadata: Metadata = { title: "料金プラン" };
export default function PlansPage() {
  return (
    <div className="container">
      <PageHeading label="SIMPLE PLANS" title="容量で選べる、3つの料金。">
        データ容量で選べる3つのプラン。表示価格はすべて税込です。
      </PageHeading>
      <PlanCards />
      <div className="included">
        <span>すべてのプランに含まれます</span>
        <strong>5G対応</strong>
        <strong>テザリング無料</strong>
        <strong>契約期間の縛りなし</strong>
        <strong>事務手数料0円</strong>
      </div>
      <section className="section">
        <SectionHeading
          label="MAKE IT YOURS"
          title="必要なオプションだけ、プラス。"
        />
        <div className="option-grid">
          {calls.map((call) => (
            <article className="card" key={call.id}>
              <span className="eyebrow">VOICE</span>
              <h3>{call.name}</h3>
              <p>{call.detail}</p>
              <p className="option-price">
                +{yen(call.price)}
                <small>円 / 月</small>
              </p>
            </article>
          ))}
          <article className="card">
            <span className="eyebrow">SUPPORT</span>
            <h3>あんしんサポート</h3>
            <p>スマホの初期設定・操作相談</p>
            <p className="option-price">
              +330<small>円 / 月</small>
            </p>
          </article>
        </div>
        <p className="fineprint">
          ※ 5分超過分は22円 /
          30秒。かけ放題は一部の電話番号・国際通話等を対象外とする想定です。端末代・従量通話料・各種法定料金はシミュレーターに含みません。
        </p>
      </section>
      <div className="notice">
        <strong>20GBをご検討中の方へ</strong>
        <p>
          新規申込なら、基本料金が3か月間980円に。
          <Link className="text-link" href="/campaign">
            キャンペーン詳細 →
          </Link>
        </p>
      </div>
      <section className="section">
        <Cta />
      </section>
    </div>
  );
}
