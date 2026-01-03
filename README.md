## ①課題名
Change English Learning ―苦痛前提の学習から、人類を開放せよ―

## ②アプリのデプロイURL
- 本アプリはPHP/MySQLをローカル環境XAMPPで動作させるアプリです。
- デモでは実際の動作を画面共有にて紹介します。動画は以下に掲載しました。
<p>https://github.com/user-attachments/assets/f3caf5cc-322d-416a-96ea-76b71c7ec5da</p>

## ③GitHubリポジトリURL
https://github.com/TSAT08Ryuma/Hackathon20260106

## ④どんな作品か
- 「英語学習は苦痛でつまらなくて高い」という前提を破壊するために作ったアプリ
- 学習者が興味のあるテーマを入力すると、AI（Gemini）が約1分の英語教材を自動生成
- 生成された英文は、ブラウザ標準の音声読み上げ機能を使って即座に音読・シャドーイング可能
- 作成した教材は保存・再生・削除ができ、学習履歴として再利用可能

## ⑤工夫した点・こだわった点
- 自分の関心がある話だけで、適切な難易度で英語学習可（中３～ネイティブレベル）
- phpとSQLとJSを活用し、簡単保存・簡単削除・簡単再生のUI
- 超安価なAI使用＆ブラウザの読み上げ機能で低コスト化

# 使い方
## 前提
- XAMPPでApacheとMySQLを起動する。

## PHPアプリの設定
- `gemini.php` / `db.php`: 接続文字列のDB名（8行目）を設定し、`SELECT`文のテーブル名（14行目）を置き換える。
- `delete.php`: 接続文字列のDB名（14行目）と`DELETE FROM`のテーブル名（20行目）を設定する。
- `insert.php`: 接続文字列のDB名（18行目）と`INSERT INTO`のテーブル名（24行目）を設定する。
- DBテーブル: `id` (INT, PK, AUTO_INCREMENT)、`title` (STR)、`content` (STR)。

## Nodeサーバー (`node/server.js`)
- CORS: 11行目の`origin`をフロントのURLに合わせて配列で指定。
- 環境変数: `.env` を作成し `GEMINI_API_KEY=あなたのGeminiのAPIキー` を設定（Gitには含めない）。
- ポート: 60行目の`const PORT = process.env.PORT || 3000;`。ホスティングで`PORT`が渡される場合はそれを使用し、ローカルは3000。

## フロント (`js/app.js`)
- 83行目のAPIエンドポイントを本番のURLに置き換える。

## 起動
- PHP: XAMPPのフォルダ内に配置してブラウザでアクセス。

- Node: `npm run dev`。


