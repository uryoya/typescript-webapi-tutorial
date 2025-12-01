# 第2章：Express 基礎

## 学習目標

- Express の基本概念（ルーティング、ミドルウェア）を理解する
- TypeScript での型付けを学ぶ

## Express とは

**Express** は Node.js で最も人気のある Web アプリケーションフレームワークです。シンプルで柔軟性が高く、REST API の構築に適しています。

主な特徴：
- ルーティング機能
- ミドルウェアシステム
- HTTP リクエスト/レスポンスの簡潔な扱い
- 豊富なエコシステム

## app.ts と index.ts の分離

まず、Express アプリケーションの構造を理解しましょう。

### なぜ分離するのか？

- **`app.ts`** - Express アプリケーションの設定（ルート、ミドルウェアなど）
- **`index.ts`** - サーバーの起動処理

この分離により、**テスト時に `app` だけを import できる**ようになります。サーバーを起動せずに API のテストができるため、テストが高速になります。

### app.ts の実装

`src/app.ts` を以下のように実装します：

```typescript
import express from "express";

const app = express();

// Middleware
app.use(express.json());

export { app };
```

### index.ts の実装

`src/index.ts` を以下のように実装します：

```typescript
import { app } from "./app.js";
import { env } from "./config/env.js";

const port = Number.parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

実行してみましょう：

```bash
npm run dev
```

```
Server is running on http://localhost:3000
```

サーバーが起動しました！ただし、まだエンドポイントを定義していないので、アクセスしてもエラーになります。

## 基本的なルーティング

### ヘルスチェックエンドポイントの追加

`src/app.ts` にヘルスチェック用のエンドポイントを追加します：

```typescript
import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export { app };
```

サーバーを起動して、別のターミナルで確認してみましょう：

```bash
curl http://localhost:3000/health
```

```json
{"status":"ok"}
```

成功です！

### Request と Response の型

Express のハンドラーには、`Request` と `Response` の型を明示できます：

```typescript
import type { RequestHandler } from "express";

const handler: RequestHandler = (req, res) => {
  // req: Request
  // res: Response
  res.json({ status: "ok" });
};
```

今回はシンプルにするため、型推論に任せる形で進めますが、複雑な処理では型を明示すると安全です。

## ミドルウェアの仕組み

**ミドルウェア**は、リクエストとレスポンスの間で実行される関数です。

```typescript
app.use((req, res, next) => {
  // 何かの処理
  next(); // 次のミドルウェアへ
});
```

### express.json() ミドルウェア

```typescript
app.use(express.json());
```

このミドルウェアは、JSON 形式のリクエストボディを自動的にパースします。これがないと、`req.body` が `undefined` になります。

### カスタムミドルウェア：リクエストログ

リクエストをログ出力するミドルウェアを作成してみましょう：

```typescript
import express from "express";
import type { RequestHandler } from "express";

const app = express();

// Middleware
app.use(express.json());

// Request logging middleware
const requestLogger: RequestHandler = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
app.use(requestLogger);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export { app };
```

サーバーを再起動して、アクセスしてみましょう：

```bash
curl http://localhost:3000/health
```

コンソールにログが出力されます：

```
[2025-01-15T10:30:00.000Z] GET /health
```

## CORS 設定

フロントエンドと接続するために、CORS（Cross-Origin Resource Sharing）を設定します。

```typescript
// CORS (Allow all origins for development)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
```

**注意：** `*` はすべてのオリジンを許可します。本番環境では、特定のドメインのみを許可するようにしてください。

## エラーハンドリングミドルウェア

エラーが発生したときに、適切なレスポンスを返すためのミドルウェアを作成します。

### 404 ハンドラー

存在しないパスへのアクセスに対して、404 エラーを返します：

```typescript
// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});
```

### エラーハンドリングミドルウェア

```typescript
import type { ErrorRequestHandler } from "express";

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
app.use(errorHandler);
```

**重要：** エラーハンドリングミドルウェアは、**必ず最後に配置**してください。

## 完成版の app.ts

これまでの内容をまとめると、以下のようになります：

```typescript
import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";

const app = express();

// Middleware
app.use(express.json());

// CORS (Allow all origins for development)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Request logging middleware
const requestLogger: RequestHandler = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
app.use(requestLogger);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
app.use(errorHandler);

export { app };
```

## ハンズオン：動作確認

### 1. ヘルスチェック

```bash
curl http://localhost:3000/health
```

```json
{"status":"ok"}
```

### 2. 存在しないパスへのアクセス

```bash
curl http://localhost:3000/nonexistent
```

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found"
  }
}
```

### 3. ログの確認

コンソールにリクエストログが出力されていることを確認してください：

```
[2025-01-15T10:30:00.000Z] GET /health
[2025-01-15T10:30:05.000Z] GET /nonexistent
```

## 章末チェックリスト

以下の項目を確認してください：

- [ ] `GET /health` が動く
- [ ] リクエストごとにログが出る
- [ ] 存在しないパスに 404 が返る
- [ ] CORS ヘッダーが設定されている

すべて確認できたら、[第3章 REST API 設計と実装](./03-todo-api.md) に進みましょう！

---

## コラム

> 📝 **コラム：app.ts と index.ts を分ける理由**
>
> テスト時に `app` だけを import したい、というのが主な理由です。`index.ts` でサーバーを起動すると、import するだけでサーバーが立ち上がってしまいます。`app.ts` で Express アプリケーションの設定だけを export することで、テストでは `app` を import してリクエストを送る、本番では `index.ts` を実行してサーバーを起動する、という使い分けができます。

> 📝 **コラム：Express 5 で何が変わったか**
>
> Express 5 では、**async/await のエラーが自動でキャッチされる**ようになりました。Express 4 では、async 関数内で発生したエラーを `next(err)` で明示的に渡す必要がありましたが、Express 5 ではそれが不要になり、コードがシンプルになります。また、多くの非推奨機能が削除され、モダンな JavaScript に対応しています。
