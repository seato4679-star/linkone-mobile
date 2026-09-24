"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { statuses, statusLabels, type Status } from "@/lib/plans";

export function AdminLogin() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.ok)
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "ログインできませんでした。時間をおいて再度お試しください。",
        );
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof TypeError
          ? "通信に失敗しました。接続を確認して再度お試しください。"
          : error instanceof Error
            ? error.message
            : "ログインできませんでした。",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="card login-card"
      onSubmit={handleLogin}
      aria-busy={pending}
    >
      <span className="eyebrow">STAFF ACCESS</span>
      <h1>社員向けログイン</h1>
      <p>管理用パスワードを入力してください。</p>
      <div className="field">
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <button className="button primary full" disabled={pending}>
        {pending ? "ログイン中…" : "ログイン →"}
      </button>
      <p className="fineprint">
        ローカルデモの初期設定はREADMEを参照してください。
      </p>
    </form>
  );
}
export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("ログアウトに失敗しました。");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <button
        className="button outline small"
        disabled={pending}
        onClick={logout}
      >
        {pending ? "処理中…" : "ログアウト"}
      </button>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function StatusEditor({ id, initial }: { id: string; initial: Status }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.application)
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "更新結果を確認できませんでした。再読み込みして状態をご確認ください。",
        );
      setMessage("ステータスを更新しました。");
      router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof TypeError
          ? "通信に失敗しました。再読み込みして状態をご確認ください。"
          : error instanceof Error
            ? error.message
            : "更新できませんでした。",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={save} className="card" aria-busy={pending}>
      <span className="eyebrow">WORKFLOW</span>
      <h2>対応ステータス</h2>
      <div className="field">
        <label htmlFor="status">ステータスを選択</label>
        <select
          id="status"
          disabled={pending}
          value={status}
          onChange={(event) => setStatus(event.target.value as Status)}
        >
          {statuses.map((item) => (
            <option value={item} key={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
      </div>
      <button
        className="button primary full"
        disabled={pending || status === initial}
      >
        {pending ? "保存中…" : "変更を保存する"}
      </button>
      {message && (
        <p
          role={failed ? "alert" : "status"}
          className={failed ? "error-message" : "success-message"}
        >
          {message}
        </p>
      )}
      <p className="fineprint">変更は申込一覧にも反映されます。</p>
    </form>
  );
}
