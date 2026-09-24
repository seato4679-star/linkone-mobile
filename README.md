# LinkOne Mobile

架空の通信サービスを題材に、集客・料金比較・申込・社内管理までをつなぐ学習用ポートフォリオです。実際の契約・回線開通・請求は発生しません。入力は架空の情報だけにしてください。

## なぜ作ったか

見た目だけのサイトではなく、ブラウザの操作がAPIを呼び、データが保存され、別の管理画面から同じデータを更新できる仕組みを学ぶために作りました。Reactの状態管理と、サーバーでの認証・検証・DB操作の役割を分けています。

## できること

- キャンペーンLPから公式サイト・料金シミュレーターへの誘導
- 3GB / 990円、20GB / 1,980円、50GB / 2,980円の比較（税込）
- 通話・サポートオプションとキャンペーンを含む即時試算
- 選択内容を引き継ぐ申込フォーム、ブラウザとAPI両方の入力検証
- API経由の申込保存、受付番号の表示
- パスワード付き管理画面、件数集計、検索、絞り込み、詳細確認
- pending → reviewing → completed のステータス更新（戻す操作も可能）

## 技術と依存関係

Next.js 16 / App Router、React 19、TypeScript、Tailwind CSS 4、Supabase / PostgreSQL、Git。Node.js 24で検証し、`package.json`ではNode.js 22.13以上をサポート対象にしています。VercelのNode.js実行環境を想定しています。

ReactのuseState・標準fetch・Node.jsのcrypto/fsを使用。DB SDK、フォームライブラリ、UI部品ライブラリ、状態管理ライブラリは追加していません。`server-only`は秘密鍵を扱うモジュールのクライアントへの誤混入を防ぐビルド時ガードです。ESLintは静的解析、TypeScriptは型チェックを担当します。Tailwindは共通リセット・テーマ・ユーティリティ（sr-only等）に使い、見た目は読みやすい名前付きCSSを中心に定義しています。

## システム構成

```text
Browser (React)
  └─ fetch / HTTP JSON
      └─ Next.js Route Handler
          ├─ 入力検証 / 管理操作の認証
          └─ サーバー専用データアクセス
              ├─ DBモード: Supabase REST API → PostgreSQL
              └─ ローカルデモ: .local/applications.json
```

管理ページはServer Componentから同じデータアクセス関数を呼びます。サーバーが自分自身のHTTP APIを呼ぶ必要はないためです。ブラウザからの申込送信・ステータス変更はAPIを経由します。

## セットアップ（ローカルデモ）

Node.js 22.13以上とnpmを用意し、このフォルダーで以下を実行します（Node.js 24で検証済み）。

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

`.env.local`がすでにある場合はコピーして上書きせず、既存の値を確認してください。macOS / Linuxで新規作成する場合は `cp .env.example .env.local` です。

[http://127.0.0.1:3000](http://127.0.0.1:3000) を開きます。開発サーバーはこのPCだけからアクセスできるアドレスにバインドします。

管理画面は `/admin`。`.env.example`をそのままコピーした場合のローカルデモ用パスワードは `linkone-local-demo` です。実環境にこの値を使わないでください。

ローカルデモ以外では、サンプルの管理パスワード・署名鍵をコード側でも拒否します。DBモードを使う場合も、自分専用の値へ変更してください。`SESSION_SECRET`はログインと申込完了の両方のCookie署名に使います。

`DEMO_MODE=true`を明示した場合のみローカル保存します。DB接続に失敗しても自動でローカル保存へ切り替えません。Vercel上ではDEMO_MODEをtrueにしてもローカル保存を無効にします。ローカルデモは単一Node.jsプロセス用です。

## 環境変数

| 名前                        | 用途                                 | 設定                                       |
| --------------------------- | ------------------------------------ | ------------------------------------------ |
| `DEMO_MODE`                 | ローカルファイル保存の明示的な有効化 | ローカルのみ `true`、Vercelは`false`       |
| `SUPABASE_URL`              | SupabaseプロジェクトのURL            | DBモードで必須                             |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー専用のservice_roleキー       | DBモードで必須                             |
| `ADMIN_PASSWORD`            | 社員画面の共有パスワード             | 12文字以上。公開時は十分に長いランダムな値 |
| `SESSION_SECRET`            | ログインCookieの署名鍵               | 32文字以上。公開時に必ず新規生成           |

環境変数には`NEXT_PUBLIC_`を付けません。`.env*`、`.local/`はGit対象外です。サンプルの`.env.example`だけをコミット対象にしています。

署名鍵の生成例（表示された値を自分の環境変数へ設定）:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

環境変数の変更後はサーバーを再起動してください。

## Supabase / PostgreSQLの構築

1. 自分のSupabaseアカウントでプロジェクトを作成します。
2. SQL Editorで [supabase/schema.sql](supabase/schema.sql) を新しいDBに一度実行します。
3. プロジェクト設定からURLとサーバー用の`service_role`キーを確認します。JWT形式のlegacyキーは`apikey`と`Authorization`の両方、新形式の`sb_secret_...`キーは`apikey`だけでSupabase REST APIへ送ります。publishable / anonキーではありません。
4. `.env.local`にURLとキーを設定し、`DEMO_MODE=false`にします。
5. 開発サーバーを再起動し、架空の情報で1件申し込みます。
6. Supabase Table Editorと `/admin`で同じ申込が見えることを確認します。
7. 管理画面からステータスを変更し、Table Editorでも反映を確認します。

`applications`にはUUID主キー、連絡先、プラン・オプション、同意、ステータス、作成日時を保存します。行レベルセキュリティ（RLS）を有効化し、`anon` / `authenticated`のアクセス権を取り消しています。ブラウザ向けの許可ポリシーは作りません。APIサーバーだけがservice_roleで操作します。

このスキーマは新規構築用です。既存テーブルを変更する場合は、データを保護した別のmigrationを作成してください。

削除依頼を受けた場合は、権限を持つ運営者がSupabase SQL Editorで受付番号を確認して対象レコードを削除します。公開前に`/privacy`の連絡先と保存期間のTODOを実際の運用方針へ置き換えてください。

## ページ・API

| URL                        | 役割                       |
| -------------------------- | -------------------------- |
| `/`                        | 公式トップ、特徴・FAQ・CTA |
| `/campaign`                | 20GB・3か月間980円のLP     |
| `/plans`                   | 料金・オプション比較       |
| `/simulator`               | useStateによる料金試算     |
| `/apply`                   | 申込フォーム               |
| `/complete?id=...`         | 受付番号の表示             |
| `/privacy`                 | デモ利用・情報の扱い       |
| `/admin`                   | ログイン / 集計・一覧      |
| `/admin/applications/[id]` | 個別の詳細・ステータス変更 |

| メソッド / URL                 | 内容                          | 認証                       |
| ------------------------------ | ----------------------------- | -------------------------- |
| `POST /api/applications`       | 申込作成。成功時201と`{ id }` | 不要・同一Origin必須       |
| `PATCH /api/applications/[id]` | `{ status }`で変更。`{ application }`を返す | 管理Cookie・同一Origin必須 |
| `POST /api/admin/session`      | `{ password }`でログイン      | パスワード照合             |
| `DELETE /api/admin/session`    | ログアウト                    | 同一Origin必須             |

Originはリクエスト元のサイトを表すヘッダーです。APIをターミナルから検証する場合も、アクセス先に一致するOriginと`Content-Type: application/json`を送ってください。画面からのfetchではブラウザがOriginを送ります。

## 起動・確認コマンド

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

`npm run start`は事前にビルドが必要です。別のターミナルで以下を実行できます。

```powershell
npm run test:smoke
node scripts/qa-links.mjs
```

スモークテストはlocalhost + DEMO_MODE=trueのサーバー専用です。実行ごとに架空の申込1件を作ります。認証・入力エラー・更新・秘密情報の非公開などを確認します。連続実行で429になった場合は1分待ってください。途中失敗したテストが作った申込もローカルに残ることがあります。

手動確認: シミュレーターで20GB・5分通話・サポートを選択 → 1,860円（4か月目2,860円）を確認 → 申込 → 完了 → 管理ログイン → 詳細 → ステータス変更。ブラウザの開発者ツールのNetworkではPOSTとPATCHの要求・応答を見られます。

## Vercelへデプロイ

1. GitHub等に自分のリポジトリを作り、このプロジェクトをpushします。秘密ファイルが含まれないことを `git status` で確認します。
2. VercelでそのリポジトリをImportし、Framework PresetをNext.js、Node.jsを24.xにします。
3. Build Commandは`npm run build`。標準のOutput Directory設定を使います。
4. 上記の環境変数をPreview / Productionの必要な環境に設定。`DEMO_MODE=false`、独自の管理パスワードと署名鍵、Supabase URL / service_roleキーを指定します。
5. Deployし、発行されたHTTPS URLで申込と管理操作を確認します。
6. 公開前に、自分の運営方針に合わせて `/privacy` の連絡先・保存期間を追記し、実個人情報の入力を避ける運用にします。

ブラウザに秘密キーを入力させる画面はありません。VercelのEnvironment Variablesに設定してください。独自ドメインは必須ではありません。

## セキュリティと制限事項

- 本格的な社員認証を簡略化し、共有パスワード + 署名付きHttpOnly Cookie（8時間）を実装。HTTPS時Secure、SameSite=Strict。認証自体は省略していません。
- ユーザー別アカウント、MFA、監査ログ、パスワードリセットは未実装。ログアウトは現在のブラウザのCookie削除であり、コピーされたCookieを個別失効させる機能はありません。署名鍵を変えると全Cookieが無効になります。
- ログインは1分5回、申込は1分10回のメモリ内制限。Vercelのプロキシが設定する`x-real-ip`を優先し、ない場合は`x-forwarded-for`を使います。サーバー再起動・複数インスタンスでは共有されません。Vercel以外の任意プロキシ環境では、これらのヘッダーを無条件に信頼せず、実運用にはWAFまたは共有ストアでの制限が必要です。
- Origin検証はCSRF対策です。外部の直接HTTPクライアントによる申込を防ぐ認証やボット対策の代わりにはなりません。
- フォームの二重クリックを防ぎますが、ネットワーク切断後の再送まで保証する冪等性キーは未実装。応答喪失時は管理画面で登録有無を確認してください。
- 申込一覧は小規模デモ向けに全件を取得して検索・集計します。DB取得は500件ずつですが画面は全件表示。大量データにはサーバー側のページング・集計を追加してください。
- 料金は共通定義から計算し、DBには選択内容を保存します。料金改定の履歴・申込時金額の固定保存は未実装です。
- キャンペーンは表示上の試算であり、請求スケジュールを生成しません。SIM発行、本人確認、MNP、決済、メール送信は未実装です。
- 完了ページは保存成功時に発行する署名付きHttpOnly Cookieを検証します。URLの受付番号だけでは成功表示になりません。同じブラウザの最新の申込について1時間表示できます。DBの再照会は行わず、申込の現在の状態は管理画面で確認します。
- Vercel / Supabaseへの実際のデプロイ・クラウドDB接続確認には、ご本人のアカウント・接続情報が必要です。この作業環境では提供されていないため、ローカルデモで検証しています。
- ポートフォリオの公開用にrobotsをnoindexにしています。サービスとして実運用する場合は認証・運用・表示内容を見直してください。

## 学習資料

最初に全体を掴む場合は、[SYSTEM_SPECIFICATION](docs/SYSTEM_SPECIFICATION.md)から読みます。

Claude Code にレビューを依頼する場合は、[Claude Code レビュー依頼書](docs/CLAUDE_CODE_REVIEW.md) の依頼文と手順を使います。

1. [PROJECT_MAP](docs/PROJECT_MAP.md) — ファイルの場所
2. [ARCHITECTURE](docs/ARCHITECTURE.md) — 責務と技術の関係
3. [LEARNING_GUIDE](docs/LEARNING_GUIDE.md) — 用語・重要コード・練習
4. [REQUEST_FLOW](docs/REQUEST_FLOW.md) — 申込をコード単位で追跡
5. [VERIFICATION](docs/VERIFICATION.md) — 実行した検証と未確認部分
6. [PRE_RELEASE_QA](docs/PRE_RELEASE_QA.md) — 公開直前QA、修正内容、公開前後のチェックリスト

## Git

`.git`は既存のものを使用。コミット前に `git diff --check` とチェックコマンドを実行します。変更を追う場合のコミット例:

```text
feat: add LinkOne public pages and plan simulator
feat: add application API and staff management
docs: add architecture and learning guides
```

外部リポジトリへのpushや本番公開はまだ行っていません。

この作業環境ではGitの著者情報とremoteが未設定のため、コミットも未作成です。ご自身の名前・メールを`git config user.name`と`git config user.email`で設定してからコミットしてください。架空の著者情報は設定していません。

## 参考資料

- [Next.js App Router](https://nextjs.org/docs/app)
- [React useState](https://react.dev/reference/react/useState)
- [Supabase REST API](https://supabase.com/docs/guides/api)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel Next.js](https://vercel.com/docs/frameworks/nextjs)
