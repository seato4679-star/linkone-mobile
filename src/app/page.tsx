import Link from "next/link";
import { Arrow, Cta, PlanCards, SectionHeading } from "@/components/ui";

export default function Home() {
  return (
    <>
      <section className="home-hero container">
        <div className="hero-copy">
          <div className="pill">
            <span className="live-dot" />
            月額990円からのスマホ回線
          </div>
          <h1>
            つながりは、
            <br />
            もっと<span className="accent-word">シンプルに。</span>
          </h1>
          <p className="hero-description">
            3GB・20GB・50GBから、使い方に合う容量を。
            <br />
            契約期間の縛りなし。通話も必要な分だけ。
            <br className="desktop-break" />
            あなたの毎日に、ちょうどいい通信を。
          </p>
          <div className="hero-buttons">
            <Link className="button primary" href="/simulator">
              ぴったりのプランを探す <Arrow />
            </Link>
            <Link className="button subtle" href="/plans">
              料金プランを見る →
            </Link>
          </div>
          <div className="hero-checks">
            <span>✓ 契約期間の縛りなし</span>
            <span>✓ テザリング無料</span>
            <span>✓ 5G対応</span>
          </div>
        </div>
        <div
          className="hero-art"
          role="img"
          aria-label="20GB 月額1,980円。シンプルなモバイルライフのイメージ"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-caption">
            LESS COMPLEX.
            <br />
            MORE YOU.
          </span>
          <div className="floating-label top-label">
            <span className="spark">✳</span> つながるって、心地いい。
          </div>
          <div className="phone">
            <div className="phone-top">
              <span>9:41</span>
              <span>▮▮▮ ▰</span>
            </div>
            <div className="phone-notch" />
            <div className="phone-logo">
              LinkOne<span>↗</span>
            </div>
            <p className="phone-greeting">Hello, your new everyday.</p>
            <div className="phone-data">
              <span>MY SMART PLAN</span>
              <strong>
                20<small>GB</small>
              </strong>
              <div className="usage-track">
                <i />
              </div>
              <span>あなたの毎日に、ちょうどいい。</span>
            </div>
            <div className="phone-bottom">
              <span>
                月額料金
                <strong>
                  1,980<small>円</small>
                </strong>
              </span>
              <span className="round-arrow">↗</span>
            </div>
          </div>
          <div className="floating-label price-float">
            <span>はじめの3か月は</span>
            <strong>
              980<small>円 / 月</small>
            </strong>
            <span>20GB スマートプラン</span>
          </div>
          <span className="art-bottom">
            A LITTLE CHANGE. A BETTER EVERYDAY.
          </span>
        </div>
      </section>
      <div className="benefit-strip">
        <span>シンプルな3つのプラン</span>
        <span>オンラインでお申し込み</span>
        <span>毎月の固定費を軽やかに</span>
      </div>
      <section className="container section">
        <Link className="campaign-banner" href="/campaign">
          <span className="campaign-tag">WELCOME CAMPAIGN</span>
          <div>
            <p>はじめるなら、今がおトク。</p>
            <h2>
              20GBが、3か月間 <strong>月額980円</strong>
            </h2>
          </div>
          <span className="banner-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </section>
      <section className="container section features-section">
        <SectionHeading
          label="WHY LINKONE?"
          title="シンプルで、使いやすく。"
        >
          複雑な選択を減らして、毎日の使いやすさを大切にしました。
        </SectionHeading>
        <div className="feature-grid">
          {[
            {
              n: "01",
              icon: "◫",
              title: "料金は、シンプルに。",
              text: "3GB・20GB・50GB。使い方に合うプランが見つかる、わかりやすい3つの選択肢。",
            },
            {
              n: "02",
              icon: "↗",
              title: "自由を、あたりまえに。",
              text: "契約期間の縛りも、解約金もなし。ライフスタイルに合わせた通信を選べます。",
            },
            {
              n: "03",
              icon: "◎",
              title: "つながりを、身近に。",
              text: "5Gもテザリングも追加料金なし。仕事も、遊びも、あなたのペースで。",
            },
          ].map((item) => (
            <article className="feature-card" key={item.n}>
              <div className="feature-top">
                <span className="feature-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.n}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="fineprint">
          ※
          5Gは対応端末・対応エリアで利用する想定です。本サイトは通信サービスを提供しません。
        </p>
      </section>
      <section className="soft-section">
        <div className="container section">
          <SectionHeading
            label="OUR PLANS"
            title="毎日に合う、3つのプラン。"
          >
            使い方に合わせて選べる3つのプラン。どのプランも、ずっとシンプル。
          </SectionHeading>
          <PlanCards />
          <div className="center-link">
            <Link href="/plans" className="text-link">
              プラン・オプションを詳しく見る →
            </Link>
          </div>
        </div>
      </section>
      <section className="container section simulator-teaser">
        <div className="teaser-art" aria-hidden="true">
          <span>FIND YOUR FIT</span>
          <div className="bar-chart">
            <i />
            <i />
            <i />
          </div>
          <span>3GB　　 20GB　　 50GB</span>
        </div>
        <div>
          <span className="eyebrow">PLAN SIMULATOR</span>
          <h2>
            迷ったら、
            <br />
            あなたの使い方から。
          </h2>
          <p>
            データ容量と通話スタイルを選ぶだけ。
            <br />
            選んだプランの月額料金と内訳が、その場でわかります。
          </p>
          <Link href="/simulator" className="button primary">
            料金をシミュレーション <Arrow />
          </Link>
        </div>
      </section>
      <section className="container section faq-section">
        <SectionHeading label="QUESTIONS & ANSWERS" title="よくあるご質問" />
        <div className="faq-list">
          {[
            [
              "今の電話番号はそのまま使えますか？",
              "実際の通信サービスではMNP（携帯電話番号ポータビリティ）で引き継げます。このデモでは番号移行や回線開通の手続きは行いません。",
            ],
            [
              "月額料金以外に費用はかかりますか？",
              "このデモの設定では契約事務手数料・SIM発行料は0円です。通話オプションなしの場合の国内通話料は22円 / 30秒。端末代・ユニバーサルサービス料等は試算に含みません。",
            ],
            [
              "契約期間の縛りはありますか？",
              "この架空サービスでは最低利用期間と解約金はありません。実際の契約・請求は発生しません。",
            ],
            [
              "キャンペーン終了後の料金は？",
              "スマートプランは最初の3か月が月額980円、4か月目以降は月額1,980円です。通話やサポートのオプション料金は別途加算されます。",
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                <span>Q</span>
                {question}
                <i>＋</i>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="container section">
        <Cta />
      </div>
    </>
  );
}
