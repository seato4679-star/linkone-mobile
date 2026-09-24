"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container empty-state" role="alert">
      <h1>読み込みに失敗しました。</h1>
      <p>
        時間をおいてもう一度お試しください。入力済みの申込を再送する場合は、受付済みでないことをご確認ください。
      </p>
      <button className="button primary" onClick={reset}>
        もう一度読み込む
      </button>
    </div>
  );
}
