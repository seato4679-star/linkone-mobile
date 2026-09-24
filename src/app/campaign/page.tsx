import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, SectionHeading } from "@/components/ui";
export const metadata: Metadata = { title: "20GB 3か月間980円キャンペーン" };
export default function CampaignPage() {
  return (
    <>
      <section className="campaign-hero">
        <div className="container campaign-hero-inner">
          <div>
            <span className="pill">WELCOME TO LINKONE</span>
            <h1>
              20GBが、3か月間
              <br />
              月額980円。
            </h1>
            <p>
              新規申込限定。4か月目以降は月額1,980円。
              <br />
              表示は基本料金・税込。通話やオプション料金は別途。
            </p>
            <Link
              className="button primary"
              href="/apply?plan=smart&campaign=1"
            >
              キャンペーンで申し込む <Arrow />
            </Link>
            <Link className="text-link" href="/simulator?plan=smart&campaign=1">
              オプション込みの料金を試算 →
            </Link>
            <Link className="text-link campaign-service-link" href="/">
              LinkOne Mobileのサービスを見る →
            </Link>
          </div>
          <div className="campaign-price-card">
            <span className="campaign-tag">新規お申し込み限定</span>
            <div className="campaign-data">
              20<span>GB</span>
            </div>
            <p>はじめの3か月間</p>
            <div className="giant-price">
              <small>月額</small>980<span>円</span>
            </div>
            <span>税込 / 月　通常 1,980円</span>
            <div className="saving">
              3か月で合計 <strong>3,000円</strong> おトク
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        <section className="section">
          <SectionHeading
            label="A SMART START"
            title="キャンペーンのポイント"
          />
          <div className="campaign-facts">
            {[
              [
                "01",
                "たっぷり20GB",
                "SNS、動画、音楽。毎日を楽しむためのちょうどいいデータ容量。",
              ],
              [
                "02",
                "月額1,000円OFF",
                "通常1,980円の基本料金が、利用開始から3か月間980円に。",
              ],
              [
                "03",
                "オプションも自由",
                "必要な通話・サポートを追加して、自分に合った組み合わせに。",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span className="eyebrow">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="comparison card">
          <SectionHeading label="CLEAR PRICING" title="4か月目以降の料金" />
          <div className="comparison-grid">
            <div>
              <span>1〜3か月目</span>
              <strong>
                980<small>円 / 月</small>
              </strong>
              <p>キャンペーン価格</p>
            </div>
            <span className="comparison-arrow">→</span>
            <div>
              <span>4か月目以降</span>
              <strong>
                1,980<small>円 / 月</small>
              </strong>
              <p>スマートプラン通常価格</p>
            </div>
          </div>
        </section>
        <section className="section narrow">
          <SectionHeading label="CAMPAIGN DETAILS" title="キャンペーン条件" />
          <ul className="condition-list">
            <li>対象：20GB「スマート」プランへの新規お申し込み。</li>
            <li>申込時に「キャンペーンを利用する」を選択してください。</li>
            <li>
              割引：利用開始月を1か月目として、3か月間の基本料金を毎月1,000円割引。日割り計算は行わない想定です。
            </li>
            <li>
              4か月目以降は基本料金1,980円 /
              月。オプション料金は割引対象外です。
            </li>
            <li>
              受付期間：デモ公開期間中（終了日未定）。他の割引との併用はありません。実際の契約・請求は発生しません。
            </li>
          </ul>
          <div className="hero-buttons">
            <Link
              href="/apply?plan=smart&campaign=1"
              className="button primary"
            >
              20GB・980円で申し込む <Arrow />
            </Link>
            <Link href="/" className="button outline">
              公式サービスサイトへ
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
