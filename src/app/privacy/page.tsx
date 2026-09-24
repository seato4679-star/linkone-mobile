import { PageHeading } from "@/components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "デモ利用と個人情報の取り扱い" };
export default function PrivacyPage() {
  return (
    <div className="container narrow section">
      <PageHeading
        label="DEMO & PRIVACY"
        title="デモ利用と個人情報の取り扱い"
      />
      <div className="prose card">
        <h2>架空サービスの学習用デモです</h2>
        <p>
          実際の通信契約、本人確認、料金請求、回線開通は行いません。必ず架空の氏名・メールアドレス・電話番号でお試しください。
        </p>
        <h2>保存する情報と利用目的</h2>
        <p>
          入力した氏名、メールアドレス、電話番号、プラン、オプション、同意の記録、受付日時と対応ステータスを保存します。申込・管理業務の動作確認にだけ利用します。
        </p>
        <h2>保存先とアクセス</h2>
        <p>
          ローカルデモでは開発PCのファイル、DB接続時は運営者が設定したSupabaseのPostgreSQLに保存します。管理画面はパスワードで保護しています。
        </p>
        <h2>データの削除</h2>
        <p>
          本デモには利用者がデータを削除する機能はありません。実在する方の情報は入力しないでください。削除が必要な場合は、受付番号を添えて制作者へご連絡ください。
        </p>
        <p>
          お問い合わせ先：TODO（公開前に制作者の連絡方法を記載してください）
        </p>
        <p>
          保存期間：TODO（公開前に運用方針に沿った保存期間を記載してください）
        </p>
      </div>
    </div>
  );
}
