# 申込をSupabaseへ保存するための手順

## 現在の状態

Next.js版には、申込受付API、入力検証、Supabase保存、管理者ログイン、申込一覧・詳細・ステータス変更があります。接続先の設定がなければ、実際のSupabaseには保存できません。

Sitesで公開している `sites/linkone-mobile-preview` は別の静的プレビューです。そのフォームはDBへ送信しません。以下はプロジェクトのルートにあるNext.js版を接続する手順です。

## 1. Supabaseにログインしてプロジェクトを確認する

1. https://supabase.com/dashboard を開きます。
2. 自分のアカウントでログインします。アカウントがなければ登録します。
3. プロジェクト一覧にLinkOne用のものがあれば開きます。なければ「New project」から作成します。
4. プロジェクト名は `linkone-mobile` とします。DBパスワードは生成したものを自分のパスワード管理ツールに保存します。
5. 利用プラン・表示料金を確認し、学習用の範囲で作成します。使えるリージョンから利用者に近いものを選び、起動完了を待ちます。

DBパスワードとAPIのsecretキーは別物です。このアプリの接続には、次の手順で取得するURLとsecretキーを使います。

## 2. applicationsテーブルを作る

1. プロジェクトの「SQL Editor」で新しいクエリを開きます。
2. ローカルの `supabase/schema.sql` の内容を貼り付け、実行します。
3. 「Table Editor」で `applications` が作成されたことを確認します。

このSQLは新規テーブル用です。既にapplicationsがある場合は繰り返し実行したり削除したりせず、構造を確認してから変更します。

テーブルは申込を保存する表です。1行が1件の申込です。`id` が受付番号、`status` が確認状況、`created_at` が申込日時になります。氏名・メール・電話番号・プラン・オプション・同意も保存します。

SQLはRLS（行へのアクセスを制限する仕組み）を有効にし、ブラウザ向けの権限を取り消します。サーバー専用キーを持つNext.jsだけが読み書きします。

## 3. サーバーの環境変数を設定する

SupabaseのConnect画面でプロジェクトURLを確認します。Settings → API Keysでサーバー用のsecretキー（`sb_secret_...`）を確認・作成します。ブラウザ用のpublishableキーを選ばないでください。

このプロジェクトでは互換性のため環境変数名を `SUPABASE_SERVICE_ROLE_KEY` にしていますが、新形式のsecretキーも使えます。新形式は `apikey` ヘッダー、旧形式のservice_role JWTは `apikey` と `Authorization` ヘッダーで送ります。

プロジェクトルートの `.env.local` の既存設定を編集します。ファイルをサンプルで上書きせず、必要な値だけ変更します。

```dotenv
DEMO_MODE=false
SUPABASE_URL=https://自分のプロジェクト.supabase.co
SUPABASE_SERVICE_ROLE_KEY=自分のサーバー用secretキー
ADMIN_PASSWORD=自分で生成した十分に長い管理パスワード
SESSION_SECRET=自分で生成した署名用の秘密文字列
```

管理パスワードと署名鍵にはサンプルの値を使えません。管理パスワードは12文字以上、署名鍵は32文字以上が必要です。それぞれ別のランダムな値を用意します。値の生成例は以下です。出力を自分の設定に保存し、チャットやGitに貼らないでください。

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

環境変数はサーバーの設定値です。秘密キーに `NEXT_PUBLIC_` を付けるとブラウザへ渡るため、付けません。`.env.local` はGitの対象外です。

## 4. DB接続を確認する

プロジェクトのルートで実行します。

```powershell
npm run db:check
```

このコマンドはSupabaseへGETを送り、必要な列と読み取り権限を確認します。`limit=0` を付けて申込内容は取得しません。データを作成・変更せず、秘密キーも表示しません。成功しても書き込みの確認は次の手順で必要です。

## 5. 実際に1件申し込む

DBモードのローカルサーバーに対して `npm run test:database` でも確認できます。架空の申込を1件作成し、Supabaseへの保存、管理ログイン、詳細、ステータス変更を検証します。実行ごとにテスト申込が1件残ります。別ポートで起動した場合はPowerShellで `$env:TEST_BASE_URL='http://127.0.0.1:3100'` を設定してください。既存の `test:smoke` はローカルデモ専用です。

1. 既存の開発サーバーを停止し、`npm run dev` で再起動します。
2. http://127.0.0.1:3000/apply を開きます。
3. 架空の氏名、`demo@example.com`、`09000000000` などを入力して送信します。
4. 完了画面で受付番号を確認します。
5. SupabaseのTable Editorで同じIDの行が1件作成され、statusがpendingであることを確認します。
6. http://127.0.0.1:3000/admin に自分の管理パスワードでログインし、同じ申込を開きます。
7. ステータスをreviewing、completedへ変更し、Table Editorの値にも反映されることを確認します。

ブラウザのNetworkで `POST /api/applications` が201なら保存成功です。完了ページのURLを直接開いただけでは受付済みと表示しません。失敗時は入力内容を修正するか接続設定を確認し、通信が切れた場合は重複申込を避けるため管理画面で登録済みか確認します。

## コードとデータの流れ

```text
ブラウザ: src/components/application-form.tsx / handleSubmit
  ↓ fetchでJSONをHTTP POST
Next.js: src/app/api/applications/route.ts / POST
  ↓ 同一サイトからの送信か確認・入力検証
検証: src/lib/validation.ts / validateApplication
  ↓ 検証済みのデータ
DB操作: src/lib/server/applications.ts / createApplication → database
  ↓ サーバー専用キーを使ってSupabase REST APIへPOST
Supabase → PostgreSQLのapplicationsへINSERT
  ↓ 作成した行のID
API: 201と受付ID・署名付きCookieを返す
  ↓
ブラウザ: /completeへ移動
```

`await createApplication(result.data)` は、検証済みデータの保存が終わるまで待ちます。保存が失敗すれば完了画面へ進まず、APIはエラーを返します。

管理画面は `src/app/admin/page.tsx` と `src/app/admin/applications/[id]/page.tsx` です。サーバーでログインを確認してからDBを読みます。ステータス変更は `PATCH /api/applications/[id]` に送信され、認証・入力検証後にDBを更新します。

## 6. スマホから申し込めるように公開する

ローカルのlocalhostはこのPCの中だけのアドレスです。スマホから使うためにNext.js版をサーバーへ公開します。

VercelでNext.jsプロジェクトをImportし、上の5つの環境変数を設定します。`DEMO_MODE=false` とし、管理パスワード・署名鍵は公開環境専用の値を用意します。DBを分ける場合は環境ごとに対応するURLとキーを使います。

公開したHTTPS URLで手順5を再実行します。確認後、SitesのLPから申込先をこのNext.js版の `/apply` へ変更します。同一サイト内のフォームとAPIを使うので、外部サイトからAPIを直接呼ぶためのCORS設定は不要です。

LPだけSitesに残す場合、Next.jsの管理画面は `/admin` です。DBに保存されるのはNext.js版のフォームから送信した内容です。

## 完成の確認項目

- DB接続確認が成功する。
- フォーム送信でDBに申込が1件保存される。
- 再起動しても申込が残る。
- 管理者だけが申込内容を確認・変更できる。
- 不正な入力では保存されない。
- ステータス変更がDBと管理画面の両方に反映される。
- スマホから公開フォームを使って同じ流れを確認できる。

現在の共有パスワード認証・メモリ内の送信回数制限はポートフォリオ用です。実契約の受付として運用する場合は、個別の社員認証、保存期間・問い合わせ先、ボット対策なども運用に合わせて整備します。

参考: [Supabase API Keys](https://supabase.com/docs/guides/getting-started/api-keys)、[Tables and data](https://supabase.com/docs/guides/database/tables)。
