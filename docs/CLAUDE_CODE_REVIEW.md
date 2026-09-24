# Claude Code レビュー依頼書

このファイルは、LinkOne Mobile を Claude Code にレビューしてもらうときの入口です。プロジェクトのルートディレクトリを Claude Code で開き、次の依頼文をそのまま送ってください。

## Claude Code へ送る依頼文

```text
LinkOne Mobile をコードレビューしてください。

まず README.md、docs/SYSTEM_SPECIFICATION.md、docs/ARCHITECTURE.md、docs/REQUEST_FLOW.md、docs/PRE_RELEASE_QA.md を読み、要件と現在の実装を把握してください。

次に以下を実行してください。
1. npm run review:check
2. 必要に応じて src/app、src/components、src/lib、src/server、supabase/schema.sql を確認する

以下の観点でレビューしてください。
- Next.js App Router と Server / Client Component の使い分け
- TypeScript の型、安全な入力検証、エラー処理
- API の HTTP ステータス、認証、Origin 判定、レート制限
- Supabase の Service Role Key がブラウザに露出しないこと
- 申込フォームから DB 保存、管理画面の状態更新までの整合性
- モバイルを含む画面の操作性、アクセシビリティ、表示崩れ
- README と実装・仕様書の不一致
- 本番公開前に必要な修正

問題を見つけた場合は、重要度順に報告してください。
各項目には「重要度」「対象ファイルと行番号」「問題」「なぜ問題か」「最小限の修正案」を含めてください。
問題がなければ、確認した範囲と残るリスクを明記してください。
修正はまだ行わず、まずレビュー結果だけを出してください。
```

## Claude Code で開く方法

1. Claude Code を起動します。
2. このプロジェクトのフォルダを開きます。

   ```powershell
   cd "C:\Users\admin\OneDrive - 日本大学\ドキュメント\ChatGPT\開発デモ"
   claude
   ```

3. 上の「Claude Code へ送る依頼文」を貼り付けます。
4. レビュー結果を受け取ります。修正を依頼する前に、指摘内容と対象ファイルを確認します。

`claude` コマンドが見つからない場合は、Claude Code のセットアップが完了していません。Claude Code の案内に従ってインストール後、同じコマンドを実行します。

## レビュー前の前提

- `npm install` を完了させます。
- `.env.example` をコピーして `.env.local` を用意します。
- レビュー用に実在する個人情報や Supabase の秘密鍵を書き込まないでください。
- 現在はローカルデモモードで検証できます。Supabase と Vercel の実環境レビューには、それぞれの接続設定と公開後のURLが必要です。

## `npm run review:check` が行うこと

| コマンド | 確認すること |
| --- | --- |
| `npm run lint` | コードの書き方・よくあるミス |
| `npm run typecheck` | TypeScript の型の矛盾 |
| `npm test` | 料金計算と入力検証の単体テスト |
| `npm run build` | 本番用Next.jsビルドの可否 |

このコマンドはローカルデモの申込データを作成しません。ブラウザを使った画面確認や、Supabase / Vercel の実環境確認は別途必要です。

## Claude Code に渡す順番

1. このファイルでレビューの目的と実行手順を伝える。
2. [SYSTEM_SPECIFICATION.md](SYSTEM_SPECIFICATION.md) で全体像を把握する。
3. [REQUEST_FLOW.md](REQUEST_FLOW.md) で申込保存の処理を追う。
4. 指摘されたファイルを開き、修正案を理解する。
5. 修正後にもう一度 `npm run review:check` を実行する。

## GitHub Pull Request でレビューしたい場合

Claude Code はローカルのフォルダを直接レビューできます。そのため、まずは上記の方法で十分です。GitHub上のPull Requestとしてレビューする場合は、先にGitのユーザー名・メールアドレスと共有先のリモートリポジトリを設定し、初回コミットとpushを行ってください。このプロジェクトにはまだコミットもリモート設定もありません。共有先を決めずに、勝手に外部公開しないでください。
