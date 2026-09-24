export default function Loading() {
  return (
    <div className="container empty-state" role="status">
      <span className="spinner" />
      <p>読み込んでいます…</p>
    </div>
  );
}
