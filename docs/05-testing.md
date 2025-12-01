# 第5章：テスト

## 学習目標

- ユニットテストの書き方を学ぶ
- モックの使い方を理解する

## なぜテストを書くのか

テストを書くことで：
- **バグを早期に発見**できる
- **リファクタリングが安全**になる
- **仕様をコードで表現**できる

## Vitest のセットアップ

Vitest は高速で、TypeScript や ESM を標準サポートするテストフレームワークです。

### 1. 必要なパッケージのインストール

```bash
npm install --save-dev vitest @vitest/ui @types/supertest supertest
```

- `vitest` - テストフレームワーク
- `@vitest/ui` - テスト結果の UI 表示
- `supertest` - HTTP アサーション用ライブラリ

### 2. Vitest の設定

`vitest.config.ts` を作成します：

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### 3. package.json の更新

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## テストの構造

Vitest のテストは以下の構造で書きます：

```typescript
import { describe, it, expect } from "vitest";

describe("テスト対象の名前", () => {
  it("期待される動作の説明", () => {
    // Arrange (準備)
    const input = 1 + 1;

    // Act (実行)
    const result = input;

    // Assert (検証)
    expect(result).toBe(2);
  });
});
```

- `describe` - テストグループ
- `it` または `test` - 個別のテストケース
- `expect` - アサーション

## Service 層のユニットテスト

まず `tests` と `tests/services` ディレクトリを作成してから、`tests/services/todoService.test.ts` を作成します：

```bash
mkdir -p tests/services
```

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { todoService } from "../../src/services/todoService.js";
import { prisma } from "../../src/lib/prisma.js";

// Prisma をモック
vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    todo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("TodoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all todos", async () => {
      const mockTodos = [
        {
          id: "1",
          title: "Test Todo",
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(prisma.todo.findMany).mockResolvedValue(mockTodos);

      const result = await todoService.findAll();

      expect(result).toEqual(mockTodos);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
    });

    it("should filter by completed status", async () => {
      vi.mocked(prisma.todo.findMany).mockResolvedValue([]);

      await todoService.findAll(true);

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: { completed: true },
      });
    });
  });

  describe("create", () => {
    it("should create a new todo", async () => {
      const input = { title: "New Todo" };
      const mockTodo = {
        id: "1",
        title: "New Todo",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.todo.create).mockResolvedValue(mockTodo);

      const result = await todoService.create(input);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: { title: "New Todo" },
      });
    });
  });
});
```

### モックとは

**モック**は、本物の依存関係を偽物に置き換える技術です。

```typescript
vi.mock("../../src/lib/prisma.js", () => ({
  prisma: {
    todo: {
      findMany: vi.fn(), // モック関数
    },
  },
}));
```

これにより、実際のデータベースにアクセスせずにテストできます。

## API テスト（統合テスト）

まず `tests/api` ディレクトリを作成してから、`tests/api/todos.test.ts` を作成します：

```bash
mkdir tests/api
```

```typescript
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

describe("Todo API", () => {
  beforeAll(async () => {
    // テスト用DBのセットアップ
  });

  beforeEach(async () => {
    // 各テスト前にDBをクリア
    await prisma.todo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/todos", () => {
    it("should return empty array initially", async () => {
      const response = await request(app).get("/api/todos");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ todos: [] });
    });
  });

  describe("POST /api/todos", () => {
    it("should create a new todo", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({ title: "Test Todo" });

      expect(response.status).toBe(201);
      expect(response.body.todo).toMatchObject({
        title: "Test Todo",
        completed: false,
      });
      expect(response.body.todo.id).toBeDefined();
    });

    it("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api/todos")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/todos/:id", () => {
    it("should update a todo", async () => {
      // 作成
      const createResponse = await request(app)
        .post("/api/todos")
        .send({ title: "Test Todo" });
      const id = createResponse.body.todo.id;

      // 更新
      const response = await request(app)
        .patch(`/api/todos/${id}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.todo.completed).toBe(true);
    });

    it("should return 404 for non-existent todo", async () => {
      const response = await request(app)
        .patch("/api/todos/non-existent-id")
        .send({ completed: true });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("should delete a todo", async () => {
      // 作成
      const createResponse = await request(app)
        .post("/api/todos")
        .send({ title: "Test Todo" });
      const id = createResponse.body.todo.id;

      // 削除
      const response = await request(app).delete(`/api/todos/${id}`);

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const getResponse = await request(app).get(`/api/todos/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
```

### supertest の使い方

```typescript
import request from "supertest";
import { app } from "./app.js";

const response = await request(app)
  .post("/api/todos")
  .send({ title: "Test" });
```

`supertest` を使えば、サーバーを起動せずに API をテストできます。

## テストの実行

```bash
# 通常のテスト実行
npm test

# Watch モード（ファイル変更を検知）
npm test -- --watch

# UI モードで実行
npm run test:ui

# カバレッジ計測
npm run test:coverage
```

## カバレッジの見方

```bash
npm run test:coverage
```

```
------|---------|----------|---------|---------|-------------------
File  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line
------|---------|----------|---------|---------|-------------------
All   |   85.71 |      100 |      80 |   85.71 |
 app.ts |  100.00 |      100 |     100 |  100.00 |
 todoService.ts | 83.33 | 100 | 75 | 83.33 | 15-17
------|---------|----------|---------|---------|-------------------
```

- **Stmts** - 文の実行率
- **Branch** - 分岐の実行率
- **Funcs** - 関数の実行率
- **Lines** - 行の実行率

100% を目指す必要はありませんが、**重要なロジックはカバー**しておきましょう。

## 章末チェックリスト

以下の項目を確認してください：

- [ ] `npm test` が通る
- [ ] カバレッジレポートが出る
- [ ] Service 層のテストがある
- [ ] API の統合テストがある

すべて確認できたら、[第6章 Docker化](./06-docker.md) に進みましょう！

---

## コラム

> 📝 **コラム：何をテストすべきか：テストピラミッドの話**
>
> テストピラミッドは、ユニットテスト（土台）、統合テスト（中間）、E2E テスト（頂点）のバランスを表します。ユニットテストは高速で多く書き、E2E テストは遅いので少なめに。このバランスが重要です。

> 📝 **コラム：モックしすぎ問題**
>
> 何でもモックすると「テストは通るけど本番で壊れる」現象が起きます。重要な統合部分は実際の依存関係でテストすることも大切です。

> 📝 **コラム：TDD は必須か？**
>
> TDD（テスト駆動開発）は理想的ですが、必須ではありません。最低限、重要なロジックにはテストを書くことを心がけましょう。
