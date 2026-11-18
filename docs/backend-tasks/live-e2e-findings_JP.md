# バックエンドタスク：`develop` に対するライブ e2e テストの結果

[English](live-e2e-findings.md) | 日本語

**検出元：** フロントエンドのライブ Playwright テスト（`e2e/live/`、ブランチ `test/e2e-suite`）。
2026-11-17 に、バックエンド `develop`（`a11f24a`）を `DEBUG=true`・英語シードデータの独立した Docker
環境で起動して実行しました。同じコミットでのバックエンド `pytest`：1,124 件成功。
**背景：** `docs/frontend-tasks/` の5つのノート（#2、#7、#12/#27、#14/#26、#18/#19、#31/#33）への返信です。
5つのフロントエンドタスクはすべてフロントエンド `develop` にマージ済みで、下記の項目1を除き、
ノートに書かれたとおりに動作しています。
**採番の提案：** 項目1〜3は `docs/bugs.md` の #34〜#36 として登録できます。
**対応状況（2026-11-19）：** 3項目ともバックエンド `develop`（`a0fe813`）で `docs/bugs.md` #34〜#36 として対応済み
（`docs/frontend-tasks/order-item-name-and-gateway-error.md`）。フロントエンド側の対応：注文詳細で
`items[].product_name` を使用、`payment_gateway_unavailable` に専用メッセージを追加、ライブテストで商品名を
検証し、パスワード再設定リクエストの間に `rate:ip:*` をクリアしないよう変更。

## 概要

| # | 内容 | 重要度 | 現在のフロントエンドへの影響 |
|---|---|---|---|
| 1 | ファン向けの注文明細に商品名がないため、無効化された商品が注文詳細で「Unknown product」と表示される | 🟡 Medium | ファンに見える。`product-soft-delete.md` §1a の記載と矛盾 |
| 2 | パスワード再設定の IP 単位制限（3回/分）が、メール単位制限（3回/時）より先に発動する | 🔵 Low | 新しい `too_many_reset_requests` のメッセージがほぼ表示されない |
| 3 | チェックアウト時の PayPal API エラーが未処理の `500` になる | 🔵 Low | ファンには汎用的な「問題が発生しました」が表示される |

5つのノートのチェックリストのその他の項目は、実際のバックエンドに対してすべて成功しました。
パスワード変更後のセッション維持、再設定リンクの一回限り化、メール単位のログインロック、未払い・
古い表示の行での `order_not_paid`、PayPal キャンセルの 404、無効化/再有効化（ストア、詳細、カート、
管理者画面、他社マネージャーへの 403）を含みます。

## 1. ファン向け注文明細に商品名がない（🟡 Medium）

`product-soft-delete.md` §1a では、無効化された商品は「過去の注文には名前と価格付きで残る」と
されています。行自体は残りますが、ファン向けの注文 API が名前を返していません。

- `GET /order/fetch_placed_order` と `GET /order/single_placed_order/{id}` は `Order.items` を
  `OrderItem`（`app/schema/marketplace/order.py:15`）として返します。フィールドは `order_id`、
  `product_id`、`quantity`、`price` のみで、名前はありません。
- そのためフロントエンドの注文詳細ページは、名前を `GET /products/store-page` から取得しています
  （`src/pages/account/OrderDetailsPage.vue:115`）。無効化された商品はこの一覧になく、
  `GET /products/{id}/detail` も `404` になるため、ファンが名前を取得できるエンドポイントがありません。

**確認した挙動：** ファンが「Kaede Shirogane Solo Penlight」を購入し、マネージャーが無効化すると、
ファンの注文詳細の行は **「Unknown product」** と表示されます。数量と価格は正しく表示されます。
`GET /order/manager-orders-page` の明細にはすでに `product_name` があるため、マネージャー側は問題ありません。

**修正案：** `OrderItem` に `product_name: str` を追加し、`is_active` に関係なく結合した商品から
取得してください。対象はファン向けの注文エンドポイント2つと、`POST /order/checkout` が返す `Order`
です。フィールドの追加なので互換性は壊れません。手間がかからなければ `product_image_url` も
あると、過去の注文でもジャケット画像を表示できます。

**フロントエンド側の対応（1行）：** `item.product_name` を優先し、なければカタログから取得します。
フィールドが追加され次第出荷します。先に出しても問題ありません。

**受け入れ条件：** ファンとして商品を購入し、その商品を無効化してから
`GET /order/single_placed_order/{id}` を呼ぶと、明細に商品名が含まれていること。

## 2. パスワード再設定：IP 単位制限がメール単位制限を隠してしまう（🔵 Low）

`POST /profile/forgot-password` には `rate_limit(3, 60, ip_key)`（`app/router/identity/user.py:42`）
があり、その後に新しいメール単位のチェック（`app/cache/rate_limit.py` の
`FORGOT_PASSWORD_LIMIT = 3`、1時間あたり）が続きます。IP 単位の依存関係が先に実行されるため、
同じネットワークから1分以内に4回目を送ると、`too_many_reset_requests` ではなく IP 単位の `429`
（`code` なし、「N秒後に再試行」）が返ります。メール単位の制限が効くのは、1分以上間隔をあけて
送る人か、IP を変える人だけです。

どちらも拒否するので安全面では問題ありません。ただ、`auth-limits-and-unpaid-orders.md` で
フロントエンドに追加を依頼されたメール単位のメッセージは、通常の利用ではほぼ表示されません。
ライブテストでも、リクエストの間に `rate:ip:*` キーを消すことでしか到達できませんでした。

**メール単位のメッセージを表示したい場合の案：** このルートの IP 単位制限を上げる
（例：5〜10回/分。スクリプトによる大量送信は引き続き防げます）、またはメール単位のチェックを
IP 単位の依存関係より先に実行する。現在の順序が意図どおりであれば対応は不要です。その旨を
お知らせいただければ、このままにします。

## 3. チェックアウト時の PayPal API エラーが未処理の 500 になる（🔵 Low）

PayPal が認証情報を拒否した場合（`https://api-m.sandbox.paypal.com/v1/oauth2/token` から `401`）、
`gateway: "paypal"` の `POST /order/checkout` は `Unhandled error on POST /order/checkout` を
ログに出し、`code` なしの `500 Internal Server Error` を返します。

**良い点：** トランザクションは正しくロールバックされます。失敗後、注文も決済の行もなく、
カートの行も残っています（3回の試行について DB で確認済み）。

**修正案：** 注文作成時の PayPal クライアントの HTTP・ネットワークエラーを捕捉し、
`payment_gateway_unavailable` のようなコード付きで `502`（または `503`）を返してください。
フロントエンドでは「PayPal が現在応答していません。カートはそのままです。もう一度お試しください。」
のようなメッセージを追加します。同じクライアントを使う `POST /tickets/checkout` と抽選の支払いにも
同じことが言えると思われます（今回確認したのは注文のチェックアウトのみです）。

**補足（コードの不具合ではありません）：** 今回使ったローカルの `.env` にある PayPal sandbox の
認証情報は PayPal に拒否されたため、実際の sandbox でのキャンセルフローは確認できませんでした。
有効な sandbox キーがあれば、設定するだけでテスト `paypal.live.spec.js` の
「backing out of a real PayPal sandbox checkout」が自動で実行されます。

## 再現方法

バックエンドの `develop` チェックアウトから、`i-dolly-frontend` の `e2e/live/README.md` に従って実行します。

```sh
docker compose -p idolly-e2e --env-file .env -f docker-compose.yaml -f compose.e2e.yaml up -d --build
docker exec idolly-e2e-backend python scripts/seed.py
# i-dolly-frontend のブランチ test/e2e-suite で：
make e2e-live
```

項目1は `[known-gap] deactivated product's order line shows "Unknown product" ...` と出力され、
テストはその注記付きで成功します。項目1が修正されたら、テストで商品名を確認するように変更します。
