# Claude Code レビュー結果 → Codex への修正依頼

レビュー日: 2026-09-24 / レビュアー: Claude Code / 対象: LinkOne Mobile(ローカル作業ツリー、未コミット)

## レビュー時の実行結果

`npm run review:check` 全合格(lint・typecheck エラーなし、単体テスト 6/6、build 成功)。
`test:smoke`、ブラウザ実操作、Supabase / Vercel 実環境は未実施。

---

## Codex への依頼(5要素)

```
Goal:
  Claude Code のレビュー指摘(下記 #1〜#10)を、公開前品質に近づけるため最小差分で修正する。
  対象は LinkOne Mobile(架空通信サービスの学習用ポートフォリオ)。

Reference Files:
  README.md, docs/SYSTEM_SPECIFICATION.md, docs/REQUEST_FLOW.md, docs/PRE_RELEASE_QA.md,
  本ファイル, src/ 配下, supabase/schema.sql, next.config.ts, package.json
  ※ Next.js 16 のため、コード変更前に node_modules/next/dist/docs/ の該当ガイドを読む(AGENTS.md)

Output Files:
  該当ソースの修正差分 + docs/PRE_RELEASE_QA.md への修正記録追記
  各指摘の対応結果(fixed / skipped + 理由)を本ファイル末尾の「対応結果」表に記入

Constraints:
  - 外部送信・git push・Vercel デプロイ・Supabase への接続はしない
  - .env.local の値を変更・出力しない。実個人情報・秘密鍵を書かない
  - 新しい依存ライブラリを追加しない
  - #1 の連絡先・保存期間の「実際の値」は人間(司令官)が決める。Codex はプレースホルダーと TODO だけ置く
  - #2 は検証作業のため、コード変更は「キー形式による Authorization 分岐」までに留める
  - 指摘外のリファクタリングはしない

Done Criteria:
  - npm run review:check が全合格
  - npm run test:smoke(localhost + DEMO_MODE=true)が全合格
  - 追加・変更した挙動に対応する単体テストがある(#3 の文言、#5 の文字数判定など)
  - 本ファイルの「対応結果」表が埋まっている
```

---

## 指摘一覧(重要度順)

### High

**#1 プライバシーページに連絡先・保存期間がなく、削除依頼に応じる手段もない**
- 対象: `src/app/privacy/page.tsx:24-27`、`supabase/schema.sql:20`
- 問題: 「制作者にご連絡ください」とあるが連絡先がない。保存期間の記載なし。`grant select, insert, update` で削除権限がなく、アプリにも削除機能がない
- なぜ問題か: 公開後に実在の人の情報が誤入力された場合、利用者も運営も正規の削除経路を持たない
- 修正案: `/privacy` に連絡先・保存期間のプレースホルダー(TODO)を置く。README に「削除は Supabase SQL Editor で行う」運用手順を1行追加

**#2 Supabase 実接続が未検証で、キー形式の確認が必要**
- 対象: `src/lib/server/applications.ts:41-55`、`README.md:83`
- 問題: JWT 形式の service_role キーを `apikey` と `Authorization: Bearer` の両方に送る実装。新形式キー(`sb_secret_...`)で同じ送り方が通るか未確認
- なぜ問題か: 形式が合わないと公開直後から申込がすべて 503 になる
- 修正案: キーが JWT 形式(`eyJ` で始まる3区切り)のときだけ `Authorization` を付ける分岐を入れ、README に両形式の扱いを記載。実接続確認は人間がプレビュー環境で行う

### Medium

**#3 DB タイムアウト時、保存済みの可能性があるのに再送を促す**
- 対象: `src/lib/server/http.ts:50-53`、`src/app/api/applications/route.ts:44-45`、`src/components/application-form.tsx:55-58`
- 問題: 10秒タイムアウト時にも共通の「時間をおいて再度お試しください」を返し、フォームがそのまま表示する
- なぜ問題か: コミット済みの場合、再送で二重登録になる。他のエラー文言(「再送する前に確認」)と矛盾
- 修正案: 申込 POST の 503 はフォーム側で「受付済みの可能性があります。再送する前に管理担当者にご確認ください」と表示する

**#4 管理一覧で表示しない個人情報までクライアントへ送っている**
- 対象: `src/app/admin/page.tsx:56`、`src/components/application-table.tsx:9`
- 問題: Client Component の `ApplicationTable` に `Application` 全体を渡しており、全件の email・phone が RSC ペイロードに載る
- なぜ問題か: データ最小化の原則に反する
- 修正案: 渡す前に `{ id, name, plan, status, created_at }` へ絞った型を作って渡す

### Low

| # | 対象 | 問題 | 修正案 |
|---|---|---|---|
| 5 | `src/lib/validation.ts:42` / `supabase/schema.sql:4` | 氏名長を JS は UTF-16 単位、DB は `char_length`(コードポイント)で数える。サロゲートペア1文字の氏名が 400 でなく 503 になる | `[...name].length` で判定 |
| 6 | `src/lib/server/http.ts:62-63` | レート制限キーが `x-forwarded-for` 先頭値。Vercel 以外では偽装で回避可能 | README に Vercel 前提を明記(可能なら `x-real-ip` 優先) |
| 7 | `next.config.ts:9-17` | CSP・HSTS ヘッダーがない | 最低限 `frame-ancestors 'none'; object-src 'none'; base-uri 'self'` の CSP を追加 |
| 8 | `src/components/application-form.tsx:38-41, 54` | サーバー 400 の plan/call_option/support/campaign エラーの表示先がなく、サーバーエラー時のフォーカス移動もない | プラン欄付近にエラー表示、最初のエラー項目へフォーカス |
| 9 | `src/app/api/applications/route.ts:48-58` | 画面から未使用の `GET /api/applications` が全件 PII を返す面として残る | 不要なら削除し、README・仕様書の API 表からも削除 |
| 10 | `package.json:33` / `README.md:21` / `docs/SYSTEM_SPECIFICATION.md:168` | engines `>=22.13` と README「Node.js 24」の不一致。仕様書の PATCH 応答は実際 `{ application }` | 記載を実装に合わせる |

## 問題なしと確認した点

- service_role キーは `server-only` モジュールからのみ参照、`NEXT_PUBLIC_` なし
- Server / Client Component の使い分けは適切
- 変更系 API の Origin 検証、サーバー側再検証、余分なフィールド(id・status 等)を保存しない
- 管理 Cookie は HMAC 署名・HttpOnly・SameSite=Strict、`timingSafeEqual` で比較
- RLS 有効化と anon / authenticated の権限取り消し

---

## 対応結果(Codex 記入欄)

| # | 結果(fixed / skipped) | 変更ファイル | 備考 |
|---|---|---|---|
| 1 | fixed | `src/app/privacy/page.tsx`、`README.md`、`docs/PRE_RELEASE_QA.md` | 連絡先・保存期間は人が決めるTODOだけを追加。削除は権限を持つ運営者がSupabase SQL Editorで処理する運用を記載。 |
| 2 | fixed | `src/lib/server/applications.ts`、`README.md`、`docs/PRE_RELEASE_QA.md` | JWT形式だけ`Authorization`を付与し、新形式キーは`apikey`のみ。実Supabase接続は未実施。 |
| 3 | fixed | `src/lib/validation.ts`、`src/components/application-form.tsx`、`tests/domain.test.ts` | POSTの503時は再送前の確認を案内。文言の単体テストを追加。 |
| 4 | fixed | `src/app/admin/page.tsx`、`src/components/application-table.tsx` | Client Componentへ渡す一覧データを5項目に限定。 |
| 5 | fixed | `src/lib/validation.ts`、`tests/domain.test.ts` | コードポイント単位で氏名長を判定し、絵文字80・81文字のテストを追加。 |
| 6 | fixed | `src/lib/server/http.ts`、`README.md` | `x-real-ip`を優先し、Vercel以外でのヘッダー信頼に関する制限を明記。 |
| 7 | fixed | `next.config.ts` | CSPの`frame-ancestors`・`object-src`・`base-uri`とHSTSを追加。 |
| 8 | fixed | `src/components/plan-options.tsx`、`src/components/application-form.tsx` | 選択欄のサーバーエラーを表示し、既存の最初のエラー要素へのフォーカス処理で対象にする。 |
| 9 | fixed | `src/app/api/applications/route.ts`、`scripts/smoke.mjs`、`README.md`、`docs/SYSTEM_SPECIFICATION.md`、`docs/ARCHITECTURE.md`、`docs/LEARNING_GUIDE.md`、`docs/PRE_RELEASE_QA.md` | 未使用の一覧GET APIを削除。管理一覧はServer Componentのサーバー内データ取得を継続。 |
| 10 | fixed | `README.md`、`docs/SYSTEM_SPECIFICATION.md` | Node.js 22.13以上・24で検証済みに統一し、PATCH応答を`{ application }`と明記。 |
