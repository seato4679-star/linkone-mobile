# 申込ボタンから保存までを追う

この資料は実装中の関数名を使います。まず `src/components/application-form.tsx` を開いて `handleSubmit` を探してください。

## 全体の流れ

```text
利用者の選択・入力
  ↓ PlanOptions / フォームinput
React / ApplicationForm
  ↓ handleSubmit
validateApplication（ブラウザ）
  ↓ JSON.stringify → fetch
HTTP POST /api/applications
  ↓ src/app/api/applications/route.ts の POST
Origin確認 → 回数制限 → 本文を読む → validateApplication（サーバー）
  ↓ createApplication
Supabase REST API
  ↓ SQLに相当するINSERT
PostgreSQL applicationsテーブル
  ↓ 生成されたidを含む保存結果
Next.jsから201 + { id }を応答
  ↓ response.json
router.push /complete?id=...
  ↓
受付番号を表示
```

## 1. シミュレーターから選択を運ぶ

`src/components/simulator.tsx`の`Simulator`:

```tsx
const [selection, setSelection] = useState(initial);
```

`selection`が現在の選択、`setSelection`が変更をReactへ伝える関数です。初期値はサーバーページが`parseSelection`でURLから作ります。

`URLSearchParams`で `plan=smart&call=five&support=1&campaign=1` の文字列を作り、`Link`で `/apply`に渡します。個人情報はURLに入れません。申込ページの`parseSelection(await searchParams)`で既知の値だけを選び直します。URLの値は利用者が書き換えられるためです。

## 2. 氏名などを入力する

`ApplicationForm`内の`input`には`name="email"`のような名前があります。これは送信時に入力を取り出すキーになります。`label`の`htmlFor`とinputの`id`はラベルと入力欄を結び付けます。

## 3. formのsubmitをReactで受け取る

```tsx
event.preventDefault();
const form = new FormData(event.currentTarget);
```

1行目は標準の画面遷移付きフォーム送信を止めます。2行目は今送信されたフォームから入力値を読み取ります。`form.get("email")`でメール欄の値を得ます。

`submitting.current`は同じフォームからの連続送信を防ぐフラグです。`pending`は画面の「送信しています…」とボタン無効化に使います。分散システムでの再送重複を防ぐ仕組みではありません。

## 4. ブラウザで入力を検証する

`src/lib/validation.ts`の`validateApplication`に連絡先・選択・同意を渡します。

- 氏名: 2〜80文字、制御文字等を拒否。
- メール: 基本的な書式と254文字以下を確認。
- 電話: ハイフン・空白を除去して、0から始まる10〜11桁を確認。
- プラン・通話: 定義されたIDか確認。
- support / campaign: 真偽値か確認。キャンペーンはsmartのみ。
- consent: trueであることを確認。

これは厳密なメール配送可否や電話番号の所有者確認ではありません。入力形式を確認するものです。

`setErrors(result.errors)`で項目ごとの案内を表示し、`result.data`がないと送信を中止します。

## 5. fetchでJSONを送る

```tsx
const response = await fetch("/api/applications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(result.data),
});
```

| 行                                | 意味                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `fetch("/api/applications", ...)` | 同じサイトのAPIへHTTP通信する                                |
| `await`                           | 応答を待って次の行へ進む。ブラウザ全体を停止するわけではない |
| `method: "POST"`                  | 新しい申込の作成を要求する                                   |
| `Content-Type`                    | 本文がJSONであることを伝える                                 |
| `JSON.stringify`                  | JavaScriptのオブジェクトを通信できる文字列にする             |

ブラウザはこのPOSTにOriginを付けます。サーバー側はアクセス先のHostと照合します。利用者が任意のクライアントでHTTP要求を作ることは可能なので、この検査だけに依存せず次の入力検証も行います。

## 6. Next.jsのRoute Handlerが受け取る

`src/app/api/applications/route.ts`の`POST(request)`が呼ばれます。

1. `requireSameOrigin(request)`で別サイトからの操作を拒否。
2. `rateLimit(request, "apply", 10)`で短時間の連続操作を抑制。
3. `readJson(request)`でContent-Typeと8KB上限を確認し、JSONを解析。
4. `validateApplication(...)`を再実行。
5. 無効なら400と`errors`を返す。有効なら保存へ進む。

`readJson`は本文を読みながらサイズを合計します。申告されたContent-Lengthだけを信用しません。

**ブラウザと同じ検証を2回行う理由:** ブラウザのJavaScriptを使わず、攻撃者がAPIへ直接POSTできるためです。ブラウザの検証は使いやすさ、サーバーの検証は信頼境界を守るためにあります。

## 7. 保存先を選ぶ

`src/lib/server/applications.ts`の`createApplication(input)`:

- `isDemoMode()`がtrue: ローカルファイルへ保存。
- それ以外: `database<Application[]>("", { method: "POST", body: JSON.stringify(input) })`を呼ぶ。

`database`は `SUPABASE_URL/rest/v1/applications` にfetchします。`apikey`と`Authorization`はこのサーバーからSupabaseにだけ送ります。ブラウザには渡しません。

`Prefer: return=representation`は挿入したレコードを返す要求です。`AbortSignal.timeout(10_000)`でDBからの応答を無制限に待たないようにします。

## 8. PostgreSQLにレコードができる

Supabase REST APIがJSONをDBへの挿入へ変換します。SQL Editorであらかじめ作成した`applications`に保存されます。

```sql
id uuid primary key default gen_random_uuid(),
status text not null default 'pending',
created_at timestamptz not null default now()
```

1行目はIDを自動生成し、重複しない主キーにします。2行目は新規受付の状態をpendingにします。3行目はDBで受付日時を記録します。

APIは利用者から来た`id`・`status`・金額などの余分なフィールドを保存用オブジェクトにコピーしません。DB側のCHECK制約も、許可されないプランやステータスを拒否します。

## 9. 必要最小限の応答を返す

Route Handler:

```ts
const response = NextResponse.json({ id: application.id }, { status: 201 });
```

第1引数が応答本文、第2引数がHTTP設定です。201は「作成できた」を表します。氏名・メール・電話を応答に含める必要はありません。このresponseに、`createReceipt`で作った署名付きの受付情報をHttpOnly Cookieとして付けて返します。Cookieの寿命は1時間、対象パスは`/complete`です。署名設定の不備はDB保存前に確認します。

DBの接続情報不足、エラー、タイムアウトは`apiError`で503にします。接続文字列やキーを利用者向けエラーへ含めません。失敗時に別の保存先へ勝手に切り替えることもありません。

## 10. 完了画面へ移動する

`ApplicationForm`が`await response.json()`で応答を読む → `response.ok`で成功を確認 → `router.push`で `/complete?id=...` へ移動します。

`src/app/complete/page.tsx`はUUID形式と、`src/lib/server/receipt.ts`の`hasReceipt`でCookieの受付番号・期限・署名を確認してから完了を表示します。URLだけを直打ちした場合や別の受付番号では成功表示になりません。期限切れの場合は再送を促さず、受付済みか確認するよう案内します。DB上の現在のステータスは管理一覧で確認します。

## 管理者が更新する場合

`src/components/admin-controls.tsx`の`StatusEditor.save`を入口に同じ流れを追えます。違いは `PATCH`、本文が`{ status }`、APIが`isAdmin`でCookieを検証することです。保存後は`router.refresh()`がサーバーの情報を再取得します。

## 手元で観察する

ブラウザの開発者ツール → Networkを開き、架空の情報で申込します。`applications`のRequest Payload、Status 201、Responseのidを順に見ます。その後管理画面から状態を変更し、PATCHの本文と200応答を確認します。Networkログには入力データが含まれるので、実個人情報を使わないでください。
