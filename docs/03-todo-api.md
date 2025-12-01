# 第3章：REST API 設計と実装

## 学習目標

- RESTful な設計を理解する
- Zod でバリデーションを行う
- 型定義を API 仕様から起こす

## REST とは

**REST (Representational State Transfer)** は、Web API の設計原則です。

### HTTP メソッドの意味

| メソッド | 用途 | 例 |
|---------|------|-----|
| GET | リソースの取得 | `GET /api/todos` |
| POST | リソースの新規作成 | `POST /api/todos` |
| PATCH | リソースの部分更新 | `PATCH /api/todos/:id` |
| DELETE | リソースの削除 | `DELETE /api/todos/:id` |

### ステータスコード

| コード | 意味 | 用途 |
|-------|------|------|
| 200 | OK | 成功（GET, PATCH） |
| 201 | Created | 作成成功（POST） |
| 204 | No Content | 成功だがボディなし（DELETE） |
| 400 | Bad Request | バリデーションエラー |
| 404 | Not Found | リソースが見つからない |
| 500 | Internal Server Error | サーバーエラー |

## API 仕様書を読む

[API 仕様書](./api-spec.md) を確認してください。今回実装するエンドポイントは以下の5つです：

1. `GET /api/todos` - 一覧取得
2. `POST /api/todos` - 新規作成
3. `GET /api/todos/:id` - 単体取得
4. `PATCH /api/todos/:id` - 更新
5. `DELETE /api/todos/:id` - 削除

## 型定義を書く

まず `types` ディレクトリを作成してから、`src/types/todo.ts` を作成します：

```bash
mkdir src/types
```

```typescript
import { z } from "zod";

// Todo entity type
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schemas for validation
export const createTodoSchema = z.object({
  title: z.string().min(1, "title is required"),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

export const todoFilterSchema = z.object({
  completed: z.enum(["true", "false"]).optional(),
});

// Type exports from schemas
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoFilter = z.infer<typeof todoFilterSchema>;
```

### Zod とは？

**Zod** は、TypeScript のスキーマバリデーションライブラリです。

- ランタイムでバリデーションを実行
- TypeScript の型を自動生成（`z.infer<T>`）
- エラーメッセージのカスタマイズ

### なぜ Zod を使うのか？

TypeScript の型は**コンパイル時にしか存在しません**。ランタイムでは消えてしまうため、ユーザーからの入力を検証できません。

```typescript
// ❌ TypeScript の型だけでは不十分
type CreateTodoInput = {
  title: string;
};

// ユーザーが { title: 123 } を送ってきても、
// ランタイムでは検証できない！
```

Zod を使えば、**型とバリデーションを一度に定義**できます。

## Service 層の実装（インメモリ版）

まず `services` ディレクトリを作成してから、`src/services/todoService.ts` を作成します：

```bash
mkdir src/services
```

```typescript
import { randomUUID } from "node:crypto";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "../types/todo.js";

class TodoService {
  private todos: Map<string, Todo> = new Map();

  async findAll(completed?: boolean): Promise<Todo[]> {
    const todos = Array.from(this.todos.values());
    if (completed !== undefined) {
      return todos.filter((todo) => todo.completed === completed);
    }
    return todos;
  }

  async findById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const now = new Date();
    const todo: Todo = {
      id: randomUUID(),
      title: input.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const todo = this.todos.get(id);
    if (!todo) {
      return null;
    }

    const updated: Todo = {
      ...todo,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.completed !== undefined && { completed: input.completed }),
      updatedAt: new Date(),
    };

    this.todos.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }
}

export const todoService = new TodoService();
```

### UUID の生成

```typescript
import { randomUUID } from "node:crypto";

const id = randomUUID();
// 例: "550e8400-e29b-41d4-a716-446655440000"
```

Node.js の標準ライブラリを使って UUID v4 を生成します。

## Controller の実装

まず `controllers` ディレクトリを作成してから、`src/controllers/todoController.ts` を作成します：

```bash
mkdir src/controllers
```

```typescript
import type { RequestHandler } from "express";
import {
  createTodoSchema,
  todoFilterSchema,
  updateTodoSchema,
} from "../types/todo.js";
import { todoService } from "../services/todoService.js";

// GET /api/todos
export const getTodos: RequestHandler = async (req, res, next) => {
  try {
    const filterResult = todoFilterSchema.safeParse(req.query);
    if (!filterResult.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "completed must be 'true' or 'false'",
        },
      });
    }

    const completed =
      filterResult.data.completed === "true"
        ? true
        : filterResult.data.completed === "false"
          ? false
          : undefined;

    const todos = await todoService.findAll(completed);

    res.json({
      todos: todos.map((todo) => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/todos/:id
export const getTodoById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await todoService.findById(id);

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/todos
export const createTodo: RequestHandler = async (req, res, next) => {
  try {
    const result = createTodoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "title is required",
        },
      });
    }

    const todo = await todoService.create(result.data);

    res.status(201).json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/todos/:id
export const updateTodo: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = updateTodoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.errors[0].message,
        },
      });
    }

    const todo = await todoService.update(id, result.data);

    if (!todo) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.json({
      todo: {
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/todos/:id
export const deleteTodo: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await todoService.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Todo not found",
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

### safeParse の使い方

```typescript
const result = createTodoSchema.safeParse(req.body);
if (!result.success) {
  // バリデーションエラー
  return res.status(400).json({ error: ... });
}
// バリデーション成功
const data = result.data; // 型安全な値
```

`safeParse` を使うことで、エラーをキャッチして適切に処理できます。

## ルーティングの設定

まず `routes` ディレクトリを作成してから、`src/routes/todos.ts` を作成します：

```bash
mkdir src/routes
```

```typescript
import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  getTodos,
  updateTodo,
} from "../controllers/todoController.js";

const router = Router();

router.get("/todos", getTodos);
router.get("/todos/:id", getTodoById);
router.post("/todos", createTodo);
router.patch("/todos/:id", updateTodo);
router.delete("/todos/:id", deleteTodo);

export default router;
```

### app.ts に登録

`src/app.ts` を以下のように更新します：

```typescript
// Health check endpoint の後に追加
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
import todoRoutes from "./routes/todos.js";
app.use("/api", todoRoutes);

// 404 handler
app.use((_req, res) => {
  // ...
});
```

## ハンズオン：API をテストする

サーバーを起動します：

```bash
npm run dev
```

### 1. 一覧取得（空）

```bash
curl http://localhost:3000/api/todos
```

```json
{"todos":[]}
```

### 2. 新規作成

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"牛乳を買う"}'
```

```json
{
  "todo": {
    "id":"550e8400-...",
    "title":"牛乳を買う",
    "completed":false,
    "createdAt":"2025-01-15T10:30:00.000Z",
    "updatedAt":"2025-01-15T10:30:00.000Z"
  }
}
```

### 3. 一覧取得（1件）

```bash
curl http://localhost:3000/api/todos
```

### 4. 完了状態を更新

```bash
curl -X PATCH http://localhost:3000/api/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### 5. フィルタ（完了済みのみ）

```bash
curl http://localhost:3000/api/todos?completed=true
```

## フロントエンドと接続

`frontend/` ディレクトリに移動して、フロントエンドを起動します：

```bash
cd ../frontend
npm run dev
```

ブラウザで `http://localhost:5173` を開くと、ToDo アプリが表示されます。API と接続して、ToDo の追加・削除・完了切り替えができることを確認してください。

## 章末チェックリスト

以下の項目を確認してください：

- [ ] 全 CRUD エンドポイントが動く
- [ ] バリデーションエラーが正しく返る
- [ ] フィルタが動作する
- [ ] SPA から操作できる

すべて確認できたら、[第4章 Prisma でデータ永続化](./04-prisma.md) に進みましょう！

---

## コラム

> 📝 **コラム：PUT vs PATCH：どっちを使う？**
>
> **PUT** は「リソース全体の置き換え」、**PATCH** は「部分的な更新」を意味します。実務では、フィールドを個別に更新できる PATCH の方が使いやすいため、PATCH を採用することが多いです。PUT を使う場合、すべてのフィールドを送信する必要があり、クライアント側の実装が煩雑になります。

> 📝 **コラム：なぜレスポンスをオブジェクトでラップするのか**
>
> `{ "todos": [...] }` のように、配列を直接返さずオブジェクトでラップする理由は**拡張性**です。後から `{ "todos": [...], "totalCount": 100 }` のようにメタデータを追加したくなったとき、配列を直接返していると互換性が失われます。最初からオブジェクトでラップしておくことで、API の破壊的変更を避けられます。

> 📝 **コラム：Zod を使う理由：型とバリデーションの二重管理問題**
>
> TypeScript の型はコンパイル時にしか存在せず、ランタイムで消えてしまいます。そのため、ユーザーからの入力を検証するには、別途バリデーションロジックが必要です。Zod を使えば、スキーマから TypeScript の型を自動生成できるため、型とバリデーションを一度に定義できます。これにより、型とバリデーションの不一致を防げます。
