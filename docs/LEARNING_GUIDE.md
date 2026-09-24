# LinkOne Mobileで学ぶWeb開発

## 学ぶ順序

1. アプリを起動し、ユーザーとしてシミュレーター → 申込 → 完了を試す。
2. `src/app/page.tsx`で画面の構造を読み、`globals.css`と見比べる。
3. `src/lib/plans.ts`でデータ・型・関数を読む。
4. `src/components/simulator.tsx`と`plan-options.tsx`で状態とイベントを追う。
5. `src/components/application-form.tsx`の`handleSubmit`からAPIを追う。
6. `src/app/api/applications/route.ts` → `src/lib/validation.ts` → `src/lib/server/applications.ts`の順で読む。
7. `supabase/schema.sql`を読んで、JSONの値とDBの列を対応させる。
8. 管理画面・`admin-controls.tsx`・PATCH APIで更新を追う。
9. [REQUEST_FLOW](REQUEST_FLOW.md)の手順をNetworkパネルで確かめる。

## 画面を作る基本

| 用語             | 何なのか                                                         | このプロジェクトのどこか                                                | なぜ必要なのか                                        |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| HTML             | 見出し・段落・フォームなど文書の構造を表す言語                   | `page.tsx`内の`h1`, `section`, `form`が最終的にHTMLになる               | ブラウザと支援技術に内容の意味を伝える                |
| CSS              | 色・余白・配置・画面幅ごとの見た目を指定する言語                 | `src/app/globals.css`                                                   | HTMLを読みやすく、スマホでも使いやすくする            |
| JavaScript       | ブラウザやサーバーで処理を実行する言語                           | TS/TSXがビルド後にJavaScriptになる。`scripts/smoke.mjs`は直接JavaScript | クリックへの反応、計算、通信を行う                    |
| TypeScript       | JavaScriptに型の記述と静的チェックを加えた言語                   | `PlanId`, `Status`, `ApplicationInput`                                  | 許可されない値や書き間違いを実行前に発見する          |
| React            | 画面を部品と状態の組み合わせで作るライブラリ                     | `src/components`と各`page.tsx`                                          | 入力が変わった時に必要な表示を更新する                |
| Next.js          | ReactにURL管理・サーバー処理・ビルドなどを提供するフレームワーク | `src/app`、`next.config.ts`                                             | フロントエンドとバックエンドを1つの標準構成にまとめる |
| Component        | 画面の一部を返す関数・部品                                       | `PlanCards`, `PriceSummary`, `ApplicationForm`                          | 同じ表示の重複を減らし、役割ごとにコードを読める      |
| Props            | 親から子Componentへ渡す値                                        | `<PriceSummary selection={selection}>`                                  | 現在の選択に合う料金を子部品へ伝える                  |
| State            | Componentが覚えている変更可能な状態                              | `Simulator`の`selection`、フォームの`pending`                           | 利用者が今何を選んでいるか保持する                    |
| useState         | ReactにStateを作るための関数（Hook）                             | `const [selection, setSelection] = useState(initial)`                   | 状態更新をReactへ知らせ、表示を再計算する             |
| Server Component | サーバー側で処理されるReactの部品                                | `admin/page.tsx`、`plans/page.tsx`                                      | DB処理や秘密情報をブラウザへ持ち出さず画面を準備する  |
| Client Component | ブラウザでイベントやStateを扱える部品                            | `"use client"`のある`simulator.tsx`等                                   | 選択変更、入力、送信などの対話操作を実現する          |

**フロントエンド**は主に利用者が見る画面と操作、**バックエンド**は主にサーバー上の認証・検証・保存を担当します。同じNext.jsプロジェクト内でも実行場所は異なります。

## URLとHTTP通信

| 用語            | 何なのか                                   | このプロジェクトのどこか                 | なぜ必要なのか                                     |
| --------------- | ------------------------------------------ | ---------------------------------------- | -------------------------------------------------- |
| Routing         | URLに対応する処理や画面を決める仕組み      | `app/plans/page.tsx`が`/plans`になる     | 目的のページへアクセスできるようにする             |
| Dynamic Routing | URLの一部を値として扱うルート              | `admin/applications/[id]/page.tsx`       | 受付番号ごとに同じ構造の詳細画面を表示する         |
| API             | プログラム同士がやり取りするための窓口     | `/api/applications`                      | ブラウザからサーバーに保存・更新を依頼する         |
| HTTP            | Webの要求と応答のルール                    | ブラウザ→Next.js、Next.js→Supabase       | 別の実行場所のプログラム同士が通信できる           |
| GET             | データ取得を要求するHTTPメソッド           | このプロジェクトの公開APIでは未使用       | 取得だけで状態を変えない。管理一覧はServer ComponentがDBを読む |
| POST            | データ作成等を要求するHTTPメソッド         | `POST /api/applications`                 | 新しい申込を作成する                               |
| PATCH           | 一部の項目の変更を要求するHTTPメソッド     | `PATCH /api/applications/[id]`           | 申込全体を送り直さずstatusだけ更新する             |
| Request         | クライアントからサーバーへの要求           | Route Handlerの`request`引数             | メソッド・ヘッダー・入力本文をサーバーへ渡す       |
| Response        | サーバーから返す応答                       | `Response.json({ id }, { status: 201 })` | 成否と必要な結果を要求元へ伝える                   |
| JSON            | オブジェクト等を文字列で表現するデータ形式 | `JSON.stringify`、`response.json()`      | JavaScriptのメモリ内の値をHTTPの本文として運ぶ     |
| async / await   | 完了を待つ処理を順に読みやすく書く構文     | `async handleSubmit`、`await fetch`      | 通信・ファイル操作を待ってから結果を扱う           |

`GET`は一般に一覧・詳細の取得、`POST`は新規作成、`PATCH`は部分更新に使います。このプロジェクトでは個人情報を返す一覧GET APIを置かず、管理一覧はServer Componentがサーバー内で取得します。HTTPメソッドを使っただけで認証・入力検証が自動で付くわけではありません。

## 保存する仕組み

| 用語        | 何なのか                                      | このプロジェクトのどこか             | なぜ必要なのか                                      |
| ----------- | --------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Database    | 情報を整理し保存・検索・更新する仕組み        | 本番構成の申込保存先                 | ページを閉じてもデータを保持する                    |
| PostgreSQL  | リレーショナルDBを管理するソフトウェア        | Supabaseの内部で使うDB               | 型・制約・SQLで申込情報を正しく扱う                 |
| Supabase    | PostgreSQLやAPI等を提供するサービス           | `server/applications.ts`の`database` | DB運用とHTTP経由のアクセスを利用できる              |
| Table       | 同じ構造のデータをまとめた表                  | `applications`                       | 申込を1か所に整理する                               |
| Column      | 表の列。項目の名前と型                        | `email text`, `status text`等        | 各情報の意味と格納形式を決める                      |
| Record      | 表の1行                                       | 申込1件                              | 複数の項目を1件の申込として扱う                     |
| Primary Key | 1行を一意に特定する、重複・NULLを許さないキー | `id uuid primary key`                | 同姓同名でも正しい申込を更新できる                  |
| CRUD        | Create / Read / Update / Deleteの基本操作     | 作成・一覧/詳細・状態更新を実装      | データ操作を整理して設計する。削除APIは今回は未実装 |
| SQL         | DBの表定義・検索・更新などを記述する言語      | `supabase/schema.sql`                | テーブルの構造・制約・権限をコードで再現する        |

スプレッドシートの表に似ていますが、DBには同時操作やアクセス制御、制約などがあります。ローカルデモのJSONファイルはDB機能の代替ではなく、接続前の学習用保存先です。

## 環境と公開

| 用語      | 何なのか                                                 | このプロジェクトのどこか                            | なぜ必要なのか                                         |
| --------- | -------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| 環境変数  | 実行環境からプログラムへ渡す設定値                       | `.env.local`、`process.env.SUPABASE_URL`            | 開発と公開の設定を分け、秘密キーをコードに埋め込まない |
| localhost | 通信している自分自身のPCを指す名前                       | 開発中のアクセス先。実際の起動URLは`127.0.0.1:3000` | 公開前に手元だけでアプリを動かせる                     |
| Server    | 要求を受け取り処理して応答するプログラムやコンピューター | ローカルのNext.js、公開時のVercel                   | ページを返し、秘密情報を使う処理を引き受ける           |
| Git       | ファイルの変更履歴を管理する仕組み                       | `.git`、コミット、`git diff`                        | 変更理由を残し、差分を読み、前の状態へ戻れる           |
| build     | ソースコードから実行・配信用の成果物を作る処理           | `npm run build` → `.next/`                          | 本番向けに変換・最適化し、型や構成の問題を確認する     |
| deploy    | 実行できる成果物と設定をサーバーへ配置すること           | VercelへのImport / Deploy                           | 自分のPC以外の利用者がURLで使えるようにする            |

GitとGitHubは別物です。Gitは履歴管理の道具、GitHubはリポジトリを共有するサービスです。buildが通ることと、接続先DBまで正常に動くことも別です。

## 重要なコードを1行ずつ読む

### 料金定義から型を作る — `src/lib/plans.ts`

```ts
export type PlanId = (typeof plans)[number]["id"];
```

`typeof plans`は定義済み配列の型、`[number]`はその要素の型、`["id"]`はid部分の型です。結果は`"light" | "smart" | "plus"`になります。定義と別にIDの文字列を重複して管理しなくて済みます。

### Stateを更新する — `src/components/plan-options.tsx`

```tsx
onChange({ ...selection, call: call.id });
```

`...selection`で現在の選択を新しいオブジェクトにコピーし、`call`だけを置き換えます。Propsとして受け取った値を直接書き換えず、親の更新関数を呼びます。親が`setSelection`で状態を更新すると、`PriceSummary`にも新しい値が渡ります。

### 不明な外部入力を扱う — `src/lib/validation.ts`

```ts
export function validateApplication(raw: unknown);
```

`unknown`は「まだ中身を信用できない値」です。HTTP経由の値にはブラウザのTypeScript型が保証されないので、文字列か・許されたIDかを実行時に調べます。`as ApplicationInput`と型を書くだけでは検証になりません。

### サーバーの権限確認 — `src/app/api/applications/route.ts`

```ts
if (!(await isAdmin())) throw new HttpError(401, "ログインしてください。");
```

`isAdmin`の非同期な結果を待ち、falseならその先の一覧取得を止めます。`throw`されたエラーは`catch`内の`apiError`がJSONとHTTPステータスに変換します。

### 秘密情報をサーバーに閉じ込める — `src/lib/server/applications.ts`

```ts
import "server-only";
```

このモジュールをClient Componentへ取り込もうとするとビルドで検出します。ただし、Server ComponentからPropsとして秘密キーを渡せば漏れるので、何を渡しているかも確認します。

### DBの初期値 — `supabase/schema.sql`

```sql
created_at timestamptz not null default now()
```

`created_at`という列を作り、時刻型を指定し、NULLを禁止し、指定がないとDBの現在時刻を入れます。管理画面では`Intl.DateTimeFormat`と`Asia/Tokyo`で日本時間に表示します。

## 追加で登場する用語

| 用語           | 意味と使用箇所                                                                             |
| -------------- | ------------------------------------------------------------------------------------------ |
| JSX / TSX      | JavaScript / TypeScript内で画面の構造を書く構文。HTMLに似ているが`className`等の違いがある |
| Hook           | ReactのState等を使う関数。useStateはComponentのトップレベルで呼ぶ                          |
| useRef         | 再描画を起こさず値を保持。申込送信中の連打防止に使用                                       |
| Cookie         | ブラウザがサイトへの要求に添付する小さなデータ。管理ログインに使用                         |
| HttpOnly       | JavaScriptからCookieを読み取れなくする属性                                                 |
| HMAC           | 秘密鍵を用いてデータの改ざんを検出する署名方式。管理Cookieと受付Cookieに使用。`auth.ts`と`receipt.ts`を参照 |
| CSRF           | 別サイトから利用者の権限を利用して操作させる攻撃。Origin確認とSameSiteで対策               |
| RLS            | Row Level Security。DBの行へのアクセスを制御する仕組み                                     |
| UUID           | 大きな空間から生成するID形式。申込の主キーに使用。秘密パスワードではない                   |
| バリデーション | 値が決めた条件を満たすか確認すること                                                       |
| レスポンシブ   | 画面幅に合わせて配置を変える設計。CSSのmedia queryを使用                                   |
| Promise        | 非同期処理の将来の結果を表す値。fetchの結果をawaitで読む                                   |
| キャッシュ     | 以前の結果を再利用する仕組み。個人情報取得はno-storeで避ける                               |

## 小さく試す練習

1. `page.tsx`の見出しを1か所変更し、画面に反映されるか確認。
2. `globals.css`の`.primary`の色を変更し、共通ボタンへの影響を確認。
3. `plans.ts`のライト料金を変更し、比較・試算・管理詳細に伝わるか確認。学習後は戻す。
4. キャンペーンチェックを外し、初期料金と通常料金の差が消える理由を追う。
5. 空のフォームを送信し、`errors`から入力欄へ文言が届く過程を追う。
6. 管理画面で更新した後、ブラウザを再読み込みしても値が残る理由を考える。
7. `git diff`で変更を読む → `npm run lint` → `npm run typecheck` → `npm test`。

理解の目標はコードを暗記することではなく、「この値はどこから来て、誰が検証し、どこに保存されるか」を自分の言葉で説明できることです。
