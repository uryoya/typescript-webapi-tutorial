# 第4章：Prisma によるデータ永続化

## 学習目標

- ORM の役割を理解する
- Prisma の基本操作を習得する

## なぜ DB が必要か

現在の実装では、`Map<string, Todo>` でデータを保持しています。これは**インメモリ**で動作するため、サーバーを再起動するとデータが消えてしまいます。

データを**永続化**するには、データベースが必要です。

## Prisma とは

**Prisma** は、TypeScript/JavaScript 用の ORM (Object-Relational Mapping) です。

主な特徴：
- 型安全なデータベースクライアント
- 直感的なスキーマ定義
- マイグレーション機能
- 複数のデータベースをサポート（PostgreSQL, MySQL, SQLite など）

## セットアップ

### 1. Prisma のインストール

```bash
npm install --save-dev prisma
npm install @prisma/client
```

### 2. Prisma の初期化

```bash
npx prisma init --datasource-provider sqlite
```

以下のファイルが生成されます：
- `prisma/schema.prisma` - スキーマ定義
- `.env` - データベース接続情報（既に存在する場合は上書きされません）

### 3. .env の確認

`.env` ファイルに以下の行が追加されているはずです：

```env
DATABASE_URL="file:./dev.db"
```

これは、SQLite データベースファイルのパスです。

## スキーマの定義

`prisma/schema.prisma` を以下のように編集します：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Todo {
  id        String   @id @default(uuid())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### スキーマの説明

- `@id` - 主キー
- `@default(uuid())` - UUID を自動生成
- `@default(false)` - デフォルト値
- `@default(now())` - 現在時刻を自動設定
- `@updatedAt` - 更新時に自動更新

## マイグレーション

スキーマを元にデータベースを作成します：

```bash
npx prisma migrate dev --name init
```

- `dev.db` ファイルが作成されます
- `prisma/migrations/` にマイグレーションファイルが生成されます

### マイグレーションとは

データベースのスキーマ変更を**履歴として管理**する仕組みです。

- チーム開発で衝突を防ぐ
- 本番環境へのスキーマ変更を安全に適用
- ロールバックも可能

## Prisma Client の使い方

### インスタンスの作成

まず `lib` ディレクトリを作成してから、`src/lib/prisma.ts` を作成します：

```bash
mkdir src/lib
```

```typescript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

### Service 層の書き換え

`src/services/todoService.ts` を Prisma を使うように書き換えます：

```typescript
import { prisma } from "../lib/prisma.js";
import type { CreateTodoInput, UpdateTodoInput } from "../types/todo.js";

class TodoService {
  async findAll(completed?: boolean) {
    return prisma.todo.findMany({
      where: completed !== undefined ? { completed } : undefined,
    });
  }

  async findById(id: string) {
    return prisma.todo.findUnique({
      where: { id },
    });
  }

  async create(input: CreateTodoInput) {
    return prisma.todo.create({
      data: {
        title: input.title,
      },
    });
  }

  async update(id: string, input: UpdateTodoInput) {
    try {
      return await prisma.todo.update({
        where: { id },
        data: input,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string) {
    try {
      await prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const todoService = new TodoService();
```

### Prisma Client の主なメソッド

- `findMany()` - 複数取得
- `findUnique()` - 単体取得（ユニークキーで）
- `create()` - 作成
- `update()` - 更新
- `delete()` - 削除

## Controller の調整

`src/controllers/todoController.ts` で、Date オブジェクトから ISO 文字列への変換が不要になりました（Prisma が自動で JSON 化してくれます）。

### 修正前

```typescript
res.json({
  todos: todos.map((todo) => ({
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  })),
});
```

### 修正後

```typescript
res.json({ todos });
```

Prisma の Date 型は JSON にシリアライズされる際、自動的に ISO 8601 文字列に変換されます。

## 動作確認

### 1. サーバーを起動

```bash
npm run dev
```

### 2. ToDo を作成

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Prismaでデータ永続化"}'
```

### 3. サーバーを再起動

```bash
# Ctrl+C で停止
npm run dev
```

### 4. 一覧取得

```bash
curl http://localhost:3000/api/todos
```

**データが残っていれば成功です！**

## Prisma Studio

GUI でデータベースを確認できるツールです：

```bash
npx prisma studio
```

ブラウザで `http://localhost:5555` が開き、データベースの中身を確認・編集できます。

## 章末チェックリスト

以下の項目を確認してください：

- [ ] `npx prisma migrate dev` が成功する
- [ ] 全エンドポイントが引き続き動く
- [ ] 再起動後もデータが残っている
- [ ] Prisma Studio でデータを確認できる

すべて確認できたら、[第5章 テスト](./05-testing.md) に進みましょう！

---

## コラム

> 📝 **コラム：ORM を使う派 vs 生 SQL 派**
>
> ORM は便利ですが、複雑なクエリでは生 SQL の方が効率的な場合もあります。Prisma は `$queryRaw` で生 SQL も実行できるため、柔軟に使い分けられます。チーム規模や案件の性質に応じて選択しましょう。

> 📝 **コラム：マイグレーションの重要性**
>
> 本番データベースを直接いじるのは非常に危険です。マイグレーションを使えば、スキーマ変更を履歴として管理でき、チーム開発でも衝突を防げます。また、ロールバックも可能なため、安全に運用できます。

> 📝 **コラム：なぜ SQLite で始めるのか**
>
> SQLite はファイルベースで、インストール不要で手軽に始められます。開発時は SQLite を使い、本番では PostgreSQL や MySQL に差し替えるのが一般的なパターンです。Prisma なら、接続文字列を変えるだけで簡単に切り替えられます。
