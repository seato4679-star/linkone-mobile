import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/server/auth";
import { getApplication } from "@/lib/server/applications";
import { calls, estimate, getPlan, statusLabels, yen } from "@/lib/plans";
import { isUuid } from "@/lib/validation";
import { StatusEditor } from "@/components/admin-controls";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "申込詳細" };
export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const application = await getApplication(id);
  if (!application) notFound();
  const price = estimate(
    application.plan,
    application.call_option,
    application.support,
    application.campaign,
  );
  const rows = [
    ["受付番号", application.id],
    ["氏名", application.name],
    ["メールアドレス", application.email],
    ["電話番号", application.phone],
    [
      "希望プラン",
      `${getPlan(application.plan)?.name} / ${getPlan(application.plan)?.data}GB`,
    ],
    [
      "通話オプション",
      calls.find((call) => call.id === application.call_option)?.name,
    ],
    ["あんしんサポート", application.support ? "あり" : "なし"],
    ["キャンペーン", application.campaign ? "適用（3か月間）" : "なし"],
    [
      "月額見積り（税込）",
      `${yen(price.initial)}円${application.campaign ? ` / 4か月目以降 ${yen(price.regular)}円` : ""}`,
    ],
    ["デモ利用への同意", application.consent ? "同意済み" : "未同意"],
    [
      "申込日時",
      new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Tokyo",
      }).format(new Date(application.created_at)),
    ],
  ];
  return (
    <div className="admin-surface">
      <div className="container section">
        <Link href="/admin" className="text-link">
          ← 申込一覧へ戻る
        </Link>
        <div className="admin-heading">
          <div>
            <span className="eyebrow">APPLICATION DETAILS</span>
            <h1>申込詳細</h1>
          </div>
          <span className={`status-badge ${application.status}`}>
            {statusLabels[application.status]}
          </span>
        </div>
        <div className="form-layout">
          <section className="card">
            <h2>お申し込み情報</h2>
            <dl className="detail-list">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <StatusEditor id={id} initial={application.status} />
        </div>
      </div>
    </div>
  );
}
