import type { Metadata } from "next";
import { isAdmin } from "@/lib/server/auth";
import { isDemoMode, listApplications } from "@/lib/server/applications";
import { AdminLogin, LogoutButton } from "@/components/admin-controls";
import { ApplicationTable } from "@/components/application-table";
import { statuses, statusLabels } from "@/lib/plans";
export const metadata: Metadata = { title: "申込管理" };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdmin()))
    return (
      <div className="container section">
        <AdminLogin />
      </div>
    );
  const applications = await listApplications();
  return (
    <div className="admin-surface">
      <div className="container section">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">LINKONE / STAFF CONSOLE</span>
            <h1>申込管理</h1>
            <p className="muted">お客さまの新しいつながりを、ここから。</p>
          </div>
          <LogoutButton />
        </div>
        <p className="mode-notice">
          {isDemoMode()
            ? "LOCAL DEMO · ローカルファイル保存"
            : "DATABASE · Supabase / PostgreSQL"}{" "}
          · 最新情報はページを再読み込みすると反映されます。
        </p>
        <div className="stats-grid">
          <div className="stat-card">
            <span>総申込数</span>
            <strong>
              {applications.length}
              <small>件</small>
            </strong>
            <span className="stat-decoration">↗</span>
          </div>
          {statuses.map((status) => (
            <div className="stat-card" key={status}>
              <span>
                <i className={`status-dot ${status}`} />
                {statusLabels[status]}
              </span>
              <strong>
                {applications.filter((row) => row.status === status).length}
                <small>件</small>
              </strong>
            </div>
          ))}
        </div>
        <ApplicationTable
          applications={applications.map(
            ({ id, name, plan, status, created_at }) => ({
              id,
              name,
              plan,
              status,
              created_at,
            }),
          )}
        />
      </div>
    </div>
  );
}
