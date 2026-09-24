# 内部構造

## まず「実行場所」を分ける

ブラウザはユーザーが操作する場所、Next.jsサーバーは信頼してよい処理を実行する場所、DBはデータを永続的に保存する場所です。TypeScriptを使っていても、ブラウザから届く値を信用してはいけません。

```mermaid
flowchart TD
  A[Browser / ApplicationForm] -->|fetch: POST JSON| B[Next.js / api/applications/route.ts]
  B --> C[validation.ts / validateApplication]
  C --> D[server/applications.ts / createApplication]
  D -->|DB mode: fetch + private key| E[Supabase REST API]
  E --> F[(PostgreSQL / applications)]
  D -->|Local demo only| G[.local/applications.json]
  F --> E
  E --> D
  D --> B
  B -->|201 + receipt ID| A
  A --> H[/complete]
```

## 4つの層

| 層           | ファイル                                     | 責務                                |
| ------------ | -------------------------------------------- | ----------------------------------- |
| URLと画面    | `src/app/**/page.tsx`                        | ページ構成、URLのパラメーターを読む |
| 操作する部品 | `src/components/simulator.tsx`等             | 入力・状態管理・送信・表示          |
| 共通ルール   | `src/lib/plans.ts`, `validation.ts`          | 料金と型、入力ルール                |
| サーバー専用 | `src/lib/server/*.ts`, `app/api/**/route.ts` | 認証・HTTP・保存処理                |

サービス層、Repositoryインターフェース、汎用フォーム生成器などは導入していません。保存先の切り替えは `server/applications.ts` 内だけで完結します。

## Server / Client Component

`page.tsx`は原則Server Componentです。ページ本文をサーバーで準備でき、秘密情報をブラウザへ渡さずDBを読めます。

`"use client"`のある`Simulator`、`ApplicationForm`、`AdminLogin`、`StatusEditor`、`ApplicationTable`、`Header`は、ブラウザでイベントと状態を扱う部品です。Client Componentにも初回表示用HTMLがサーバーで用意され、その後ブラウザでイベント処理が有効になります（hydration）。

`PriceSummary`にはuseStateがありません。親のClient Componentから読み込まれると、そのクライアントの構成に含まれます。「use clientがないファイルは常にブラウザへ行かない」という意味ではありません。秘密処理には`server-only`を指定しています。

## 共通の料金ルール

`plans.ts`に3つのプラン、通話オプション、ステータスを定義します。`estimate`が月額を返します。

```text
通常月額 = 基本料金 + 通話オプション + サポート料金
初期月額 = 通常月額 - (スマートでキャンペーン利用なら1,000円)
```

シミュレーター、申込内容、管理詳細はこの関数を共有します。キャンペーンが対象外のプランに適用される入力はAPIで拒否します。価格そのものをユーザーから受け取って保存しないため、リクエストの金額改ざんで0円にできません。

## ルーティング

- `src/app/plans/page.tsx` → `/plans`
- `src/app/api/applications/route.ts` → `/api/applications`
- `src/app/admin/applications/[id]/page.tsx` → 受付番号ごとのページ

App Routerでは`page.tsx`は画面、`route.ts`はHTTP応答を作ります。Next.js 16では`params` / `searchParams` / `cookies()`を非同期APIとして扱います。

## 申込フォームの設計

プラン・通話・サポート・キャンペーンは`Selection`としてReactのStateで持ちます。氏名・メール・電話は送信時に標準の`FormData`で読みます。すべての文字入力をStateへ複製する必要はありません。

同じ`validateApplication`をブラウザとAPIが呼びます。ブラウザ側は利用者への案内、API側はデータを守るために必要です。TypeScriptの型はHTTP通信の入力を自動検証しません。

## 管理操作

```text
AdminLogin → POST /api/admin/session
  → passwordMatches → 署名付きCookie
  → /admin の isAdmin → listApplications → 一覧

StatusEditor → PATCH /api/applications/[id]
  → Origin確認 → isAdmin → UUID・status確認
  → updateStatus → DB更新 → JSON応答
  → router.refresh → Server Componentを再取得
```

`/admin`と詳細ページは、認証を確認してからサーバー内でDBを読みます。状態を変える`PATCH`にも個別に認証を設けます。申込一覧のJSON APIは公開せず、画面だけを隠して個人情報を返すAPIを残しません。

管理の初回一覧はServer Componentから直接`listApplications`を呼びます。ブラウザ向けGET APIも実装しており、スモークテストで検証します。

## DBとセキュリティ

スキーマは `supabase/schema.sql` にあります。

| カラム                       | 型           | 意味                                         |
| ---------------------------- | ------------ | -------------------------------------------- |
| id                           | uuid         | DBが生成する主キー                           |
| name / email / phone         | text         | 連絡先。phoneは先頭の0を保つ文字列           |
| plan                         | text + CHECK | light / smart / plus                         |
| call_option                  | text + CHECK | none / five / unlimited                      |
| support / campaign / consent | boolean      | オプション・割引・同意                       |
| status                       | text + CHECK | pending / reviewing / completed、初期pending |
| created_at                   | timestamptz  | タイムゾーンを扱える時刻、初期now()          |

RLSを有効にし、anon / authenticatedの権限を取り消します。サーバーのservice_roleはRLSをバイパスできるため、サーバー側の認証と検証が重要です。

DB通信はSupabaseが提供するPostgREST経由のHTTPです。ブラウザがPostgreSQLへ直接接続するわけではありません。`database`関数でキーを付けてfetchし、タイムアウトとHTTPステータスを確認します。ログに申込本文やキーは出しません。

## エラーと状態

申込完了は`lib/server/receipt.ts`で作る署名付きの受付Cookieにより確認します。POST APIは署名設定を保存前に検証し、保存後に1時間有効のHttpOnly Cookieを返します。`complete/page.tsx`はURLのIDとCookieのID・期限・署名を照合します。URLだけで保存成功とは表示しません。DBの現在の状態を確認する機能とは区別しています。

- 入力エラー: 400 + 項目別errors。フォームの該当入力に表示。
- 未認証: 401。ページの場合はログイン画面へ誘導。
- 別Origin: 403、存在しない申込: 404。
- 巨大な本文: 413、不適切なContent-Type: 415、操作過多: 429。
- DB未設定・通信障害: 503 + 利用者向けの短い文言。
- ページ取得中: `loading.tsx`、ページでの例外: `error.tsx`。
- 送信中: pendingでfieldset内の入力・送信を無効化。useRefでも同じフォームの連打を防ぐ。

## なぜデモモードがあるか

Supabaseの接続情報がなくても、React → HTTP → API → 保存 → 管理という流れを実行確認するためです。`.local/applications.json`はPostgreSQLではありません。画面とREADMEで保存先を明示します。

ローカル書き込みはPromiseのキューで直列化し、一時ファイルを書いてrenameします。単一プロセスで同時送信による上書きを抑えるための処理であり、DBのトランザクションの代わりにはなりません。複数プロセス・Vercelでは使いません。
