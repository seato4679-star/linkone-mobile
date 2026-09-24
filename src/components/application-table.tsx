"use client";
import Link from "next/link";
import { useState } from "react";
import type { Application } from "@/lib/validation";
import { getPlan, statuses, statusLabels } from "@/lib/plans";
export type ApplicationListItem = Pick<
  Application,
  "id" | "name" | "plan" | "status" | "created_at"
>;
export function ApplicationTable({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = applications.filter(
    (row) =>
      (status === "all" || row.status === status) &&
      `${row.name} ${row.id}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <section className="card table-card">
      <div className="table-toolbar">
        <h2>
          申込一覧 <span>{filtered.length}件</span>
        </h2>
        <div className="table-filters">
          <input
            type="search"
            aria-label="氏名・受付番号で検索"
            placeholder="氏名・受付番号で検索"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="ステータスで絞り込み"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">すべてのステータス</option>
            {statuses.map((value) => (
              <option value={value} key={value}>
                {statusLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length ? (
        <div
          className="table-scroll"
          role="region"
          aria-label="申込一覧。画面幅が狭い場合は横にスクロールできます"
          tabIndex={0}
        >
          <table>
            <caption className="sr-only">
              申込情報と現在の対応ステータス
            </caption>
            <thead>
              <tr>
                <th>お客さま</th>
                <th>プラン</th>
                <th>申込日時（日本時間）</th>
                <th>ステータス</th>
                <th>
                  <span className="sr-only">詳細</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <small>{row.id.slice(0, 8)}</small>
                  </td>
                  <td>
                    {getPlan(row.plan)?.data}GB{" "}
                    <span className="muted">/ {getPlan(row.plan)?.name}</span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("ja-JP", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Tokyo",
                    }).format(new Date(row.created_at))}
                  </td>
                  <td>
                    <span className={`status-badge ${row.status}`}>
                      {statusLabels[row.status]}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="text-link"
                      href={`/admin/applications/${row.id}`}
                      aria-label={`${row.name}の申込詳細`}
                    >
                      詳細 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state compact">
          <span className="eyebrow">NO APPLICATIONS</span>
          <h3>
            {applications.length
              ? "該当する申込がありません"
              : "まだお申し込みがありません"}
          </h3>
          <p>
            {applications.length
              ? "検索条件を変更してください。"
              : "申込フォームから送信した内容がここに表示されます。"}
          </p>
          {!applications.length && (
            <Link href="/apply" className="button outline">
              デモ申込を試す ↗
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
