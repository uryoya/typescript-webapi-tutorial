# ToDo API チュートリアル

TypeScript + Express で REST API を構築する実践的なチュートリアル教材です。

## 概要

このチュートリアルでは、シンプルな ToDo 管理 API を段階的に構築しながら、バックエンド開発の基礎を学びます。

### 学習できること

- **Node.js + TypeScript + Express** での REST API 開発
- **Prisma** によるデータベース操作
- **Zod** を使ったバリデーション
- **Vitest** でのテスト
- **Docker** によるコンテナ化
- **Cloud Run** へのデプロイ

## 前提知識

- JavaScript の基礎（変数、関数、async/await など）
- Git の基本操作

Node.js、TypeScript、Express の知識は不要です。

## チュートリアルの構成

### 📚 ドキュメント

1. **[はじめに](./docs/00-introduction.md)** - チュートリアルの概要
2. **[第1章：プロジェクトセットアップ](./docs/01-setup.md)** - 開発環境の構築
3. **[第2章：Express 基礎](./docs/02-express-basics.md)** - フレームワークの基本
4. **[第3章：REST API 設計と実装](./docs/03-todo-api.md)** - ToDo API の実装
5. **[第4章：Prisma によるデータ永続化](./docs/04-prisma.md)** - データベース接続
6. **[第5章：テスト](./docs/05-testing.md)** - API のテスト
7. **[第6章：Docker化](./docs/06-docker.md)** - コンテナ化
8. **[第7章：Cloud Run へデプロイ](./docs/07-cloud-run.md)** - 本番環境へデプロイ

### 📁 ディレクトリ構成

```
.
├── README.md              # このファイル
├── docs/                  # チュートリアルドキュメント
├── backend/               # スタート地点（受講者用）
├── complete/              # 模範解答
└── frontend/              # 配布用 SPA
```

## 始め方

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/typescript-webapi-tutorial.git
cd typescript-webapi-tutorial
```

または、GitHub でこのリポジトリを **テンプレート** として使用して、自分のリポジトリを作成してください。

### 2. 依存パッケージをインストール

```bash
cd backend
npm install
```

### 3. チュートリアルを開始

[はじめに](./docs/00-introduction.md) を読んで、第1章から順に進めてください。

## 技術スタック

### バックエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Runtime | Node.js | v22 |
| 言語 | TypeScript | ^5.7.0 |
| フレームワーク | Express | ^5.1.0 |
| バリデーション | Zod | ^3.25.0 |
| ORM | Prisma | ^6.0.0 |
| DB | SQLite | - |
| テスト | Vitest | ^3.1.0 |
| Lint/Format | Biome | ^1.9.0 |

### フロントエンド（配布用 SPA）

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| ビルドツール | Vite | ^6.0.0 |
| UIライブラリ | React | ^19.0.0 |
| データフェッチ | TanStack Query | ^5.0.0 |
| スタイリング | Tailwind CSS | v4 |

## フロントエンドとの接続

`frontend/` ディレクトリには、完成済みの SPA が用意されています。

### フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開くと、ToDo アプリが表示されます。

あなたが作成した API（`http://localhost:3000`）に接続して、実際に ToDo の追加・削除・完了切り替えができます。

## API 仕様

詳細は [API 仕様書](./docs/api-spec.md) を参照してください。

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/todos` | 一覧取得 |
| POST | `/api/todos` | 新規作成 |
| GET | `/api/todos/:id` | 単体取得 |
| PATCH | `/api/todos/:id` | 更新 |
| DELETE | `/api/todos/:id` | 削除 |

## ブランチ/タグについて

各章完了時点のコードは、ブランチまたはタグで参照できます：

```
chapter/1  → 第1章完了時点
chapter/2  → 第2章完了時点
chapter/3  → 第3章完了時点
...
chapter/7  → 第7章完了時点（完成形）
```

困ったときは、対応するブランチを checkout して参照してください：

```bash
git checkout chapter/3
```

## トラブルシューティング

### `npm install` が失敗する

Node.js のバージョンが v22 以上であることを確認してください：

```bash
node --version
```

### ポート 3000 が既に使用されている

`.env` ファイルで別のポートを指定してください：

```env
PORT=3001
```

### TypeScript のエラーが出る

`npm run build` でビルドエラーがないか確認してください。

## コントリビューション

このチュートリアルへの改善提案は Issue や Pull Request で歓迎します！

## ライセンス

MIT License

## 参考

このチュートリアルは「ハンズオン Node.js」（オライリー、2020年）の第5, 7, 8, 9章をベースに、2025年の技術スタックでリライトしたものです。

---

**Happy Coding! 🚀**
