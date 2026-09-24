import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container empty-state">
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1>ページが見つかりませんでした。</h1>
      <p>URLをご確認いただくか、トップページへお戻りください。</p>
      <Link className="button primary" href="/">
        トップページへ
      </Link>
    </div>
  );
}
