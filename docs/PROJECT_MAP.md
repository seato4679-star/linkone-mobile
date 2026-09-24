# プロジェクトマップ

```text
LinkOne Mobile/
├─ src/
│  ├─ app/                       URLの定義とページ
│  │  ├─ layout.tsx              共通ヘッダー・フッター・日本語設定・metadata
│  │  ├─ page.tsx                公式トップのHero・特徴・プラン・FAQ・CTA
│  │  ├─ globals.css             配色・余白・部品・レスポンシブ表示
│  │  ├─ design.css              白・シルバー・黒と青い操作部品の新デザイン
│  │  ├─ loading.tsx             ページ取得中の表示
│  │  ├─ error.tsx               読み込み失敗と再試行ボタン
│  │  ├─ not-found.tsx           存在しないURLの案内
│  │  ├─ campaign/page.tsx       キャンペーンLP
│  │  ├─ plans/page.tsx          料金とオプション一覧
│  │  ├─ simulator/page.tsx      URLの選択を読みSimulatorを配置
│  │  ├─ apply/page.tsx          URLの選択を読みApplicationFormを配置
│  │  ├─ complete/page.tsx       受付番号と次の流れ
│  │  ├─ privacy/page.tsx        デモ利用・個人情報の取り扱い
│  │  ├─ admin/
│  │  │  ├─ page.tsx            認証後の集計・一覧、未認証時のログイン
│  │  │  └─ applications/[id]/page.tsx   申込詳細・対応状況
│  │  └─ api/
│  │     ├─ applications/route.ts       POST作成 / GET一覧
│  │     ├─ applications/[id]/route.ts  PATCHステータス変更
│  │     └─ admin/session/route.ts      POSTログイン / DELETEログアウト
│  ├─ components/
│  │  ├─ ui.tsx                 見出し・プランカード・CTA・進行ステップ
│  │  ├─ header.tsx             ナビゲーション・スマホの開閉メニュー
│  │  ├─ plan-options.tsx       データ容量・通話・サポート選択部品
│  │  ├─ price-summary.tsx      選択内容の料金内訳と合計
│  │  ├─ simulator.tsx          Stateを持ち、選択と料金表示をつなぐ
│  │  ├─ application-form.tsx   入力・検証・API送信・完了への遷移
│  │  ├─ admin-controls.tsx     ログイン・ログアウト・ステータス更新
│  │  └─ application-table.tsx  管理一覧・氏名検索・状態による絞り込み
│  └─ lib/
│     ├─ plans.ts               プラン定義・ID型・料金計算・状態の日本語名
│     ├─ selection.ts           URLパラメーターを既知の選択値へ変換
│     ├─ validation.ts          申込の型・入力検証・UUIDとstatusの検証
│     └─ server/                server-only: ブラウザへ取り込まない処理
│        ├─ applications.ts     保存・取得・更新、Supabase / ローカルの切替
│        ├─ auth.ts             パスワード照合・Cookie署名・認証確認
│        ├─ receipt.ts          保存成功時の受付署名・完了画面の検証
│        └─ http.ts             Origin確認・JSON本文読み込み・制限・エラー応答
├─ supabase/schema.sql          DBテーブル・制約・索引・RLS・権限
├─ tests/domain.test.ts         料金・入力検証・許可値の単体テスト
├─ scripts/smoke.mjs            起動中サーバーへのHTTP実行テスト
├─ scripts/qa-links.mjs         主要ページの内部リンク先をHTTP確認
├─ docs/
│  ├─ ARCHITECTURE.md           責務・実行場所・構造の説明
│  ├─ LEARNING_GUIDE.md         用語・重要コード・学習順・練習
│  ├─ REQUEST_FLOW.md           申込を関数単位で追う
│  ├─ PROJECT_MAP.md            このマップ
│  ├─ DESIGN.md                 デザイン刷新の意図・CSSの読み方・検証記録
│  ├─ SYSTEM_SPECIFICATION.md   初心者向けの全体仕様・開発手順
│  ├─ VERIFICATION.md           実施済み検証と未検証の範囲
│  └─ PRE_RELEASE_QA.md         最終QAの判定・修正・公開チェックリスト
├─ README.md                    起動・DB設定・公開の入口
├─ .env.example                秘密情報を含まない設定例
├─ .gitignore                  秘密・生成物・ローカルデータをGitから除外
├─ package.json                依存パッケージ・実行コマンド
├─ package-lock.json           インストールする依存のバージョンを固定
├─ tsconfig.json               TypeScript・パス別名の設定
├─ next.config.ts              Next.js設定・セキュリティ用レスポンスヘッダー
├─ postcss.config.mjs          Tailwind CSSのビルド処理を接続
└─ eslint.config.mjs           Next.js / TypeScriptの静的解析ルール
```

## 自動生成・ローカル専用のもの

| パス                       | 役割                                | Git管理       |
| -------------------------- | ----------------------------------- | ------------- |
| `.git/`                    | Gitの履歴と管理情報                 | Git自身が管理 |
| `.env.local`               | 自分の接続情報・秘密情報            | しない        |
| `.local/applications.json` | デモモードの申込データ              | しない        |
| `node_modules/`            | npm installで導入するパッケージ本体 | しない        |
| `.next/`                   | 開発・ビルドの生成物                | しない        |
| `next-env.d.ts`            | Next.jsが自動生成する型定義の参照   | しない        |
| `tsconfig.tsbuildinfo`     | TypeScriptの増分チェック情報        | しない        |
| `AGENTS.md` / `CLAUDE.md` | Next.jsが生成した開発エージェント向け案内 | する（秘密情報なし） |

この版では画像ファイルを使わず、HeroのスマートフォンをHTML/CSSで描いているため`public/`はありません。必要になった段階で追加できます。

## ファイル名の約束

- `page.tsx`: App Routerが画面として扱う予約名。
- `layout.tsx`: 配下の画面を囲む共通の枠。
- `route.ts`: HTTPメソッドをexportしてAPIを作る予約名。
- `[id]`: 動的URLの値を受け取るフォルダー。
- `.tsx`: TypeScript + JSX。画面部品に使う。
- `.ts`: TypeScriptのロジックや型。
- `.mjs`: ES Modules形式のJavaScript。設定や実行スクリプトに使用。
- `@/`: `tsconfig.json`で設定した`src/`への別名。`@/lib/plans`は`src/lib/plans.ts`。

## 目的からコードを探す

| 変えたいもの         | 最初に読むファイル                                            |
| -------------------- | ------------------------------------------------------------- |
| サービス説明・FAQ    | `src/app/page.tsx`                                            |
| 色・余白・スマホ表示 | `src/app/globals.css`                                         |
| 料金                 | `src/lib/plans.ts`                                            |
| 選択方法             | `src/components/plan-options.tsx`                             |
| 入力条件             | `src/lib/validation.ts`                                       |
| 保存する項目         | `validation.ts` → `application-form.tsx` → `schema.sql`       |
| APIのエラー応答      | `src/lib/server/http.ts`                                      |
| 管理認証             | `src/lib/server/auth.ts` → `api/admin/session/route.ts`       |
| 管理一覧             | `src/app/admin/page.tsx` → `components/application-table.tsx` |

型だけ、画面だけ、DBだけを変えると食い違う変更があります。項目追加時は「画面入力 → 検証 → 保存 → 管理表示」の順に対応を確認してください。
