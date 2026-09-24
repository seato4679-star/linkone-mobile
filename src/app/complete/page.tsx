import type { Metadata } from "next";
import Link from "next/link";
import { isUuid } from "@/lib/validation";
import { Steps } from "@/components/ui";
import { hasReceipt } from "@/lib/server/receipt";
export const metadata: Metadata = { title: "申込受付完了" };
export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const receipt =
    typeof id === "string" && isUuid(id) && (await hasReceipt(id)) ? id : null;
  if (!receipt)
    return (
      <div className="container narrow section">
        <div className="complete-card card">
          <span className="eyebrow">APPLICATION RECEIPT</span>
          <h1>受付情報を表示できません</h1>
          <p>
            この画面は、お申し込み直後のブラウザで1時間表示できます。URLだけでは受付完了を確認できません。
          </p>
          <p>
            すでに送信した場合は、再度申し込まず、控えた受付番号で管理担当者にご確認ください。
          </p>
          <Link href="/apply" className="button primary">
            まだ申し込んでいない方はこちら →
          </Link>
          <div className="center-link">
            <Link href="/" className="text-link">
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  return (
    <div className="container narrow section">
      <Steps current={3} />
      <div className="complete-card card">
        <div className="success-icon">✓</div>
        <span className="eyebrow">THANK YOU FOR CHOOSING US</span>
        <h1>
          <span className="heading-phrase">お申し込みを</span>
          <span className="heading-phrase">受け付けました。</span>
        </h1>
        <p>LinkOne Mobileへのお申し込みありがとうございます。</p>
        <div className="receipt">
          <span>受付番号</span>
          <code>{receipt}</code>
          <small>
            この番号をお控えください。本人確認用の秘密情報ではありません。
          </small>
        </div>
        <div className="next-steps">
          <h2>このあとの流れ</h2>
          <p>
            <b>01</b> 受付番号をお控えください
          </p>
          <p>
            <b>02</b> 担当者がお申し込み内容を確認します
          </p>
          <p>
            <b>03</b> このデモではお客さまの追加手続きは不要です
          </p>
        </div>
        <p className="fineprint">
          学習用デモのため、確認メール・SIM配送・回線開通は行いません。受付状況は社員向け管理画面で確認できます。
        </p>
        <Link href="/" className="button primary">
          トップページへ戻る ↗
        </Link>
      </div>
    </div>
  );
}
