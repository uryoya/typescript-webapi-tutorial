# ToDo API チュートリアル プロジェクト仕様書

## 概要

新人教育用のTypeScript + Express REST APIチュートリアル教材を作成する。

### ゴール

- Node.js + TypeScript + Express でREST APIを構築できるようになる
- Prisma でデータベース操作ができるようになる
- テストの書き方を学ぶ
- Docker化してCloud Runにデプロイできるようになる

### 対象者

- JavaScript基礎がわかる新人エンジニア
- Git基礎がわかる

### 教材の形式

- GitHubテンプレートリポジトリとして提供
- 受講者は各自リポジトリを作成して実装を進める
- 各章完了時点のコードはブランチ/タグで参照可能
- 完成済みSPA（フロントエンド）を配布し、作ったAPIと接続して動作確認する

---

## リポジトリ構成

```
todo-api-tutorial/
├── README.md                    # リポジトリ説明、始め方
├── docs/
│   ├── 00-introduction.md       # はじめに
│   ├── 01-setup.md              # 第1章: プロジェクトセットアップ
│   ├── 02-express-basics.md     # 第2章: Express基礎
│   ├── 03-todo-api.md           # 第3章: REST API設計と実装
│   ├── 04-prisma.md             # 第4章: Prismaでデータ永続化
│   ├── 05-testing.md            # 第5章: テスト
│   ├── 06-docker.md             # 第6章: Docker化
│   ├── 07-cloud-run.md          # 第7章: Cloud Runへデプロイ
│   └── api-spec.md              # API仕様書
├── frontend/                    # 配布用SPA
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   └── TodoFilter.tsx
│   │   ├── hooks/
│   │   │   └── useTodos.ts
│   │   ├── api/
│   │   │   └── todos.ts
│   │   └── types/
│   │       └── todo.ts
│   └── dist/                    # ビルド済みも含める
├── backend/                     # 受講者のスタート地点
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .gitignore
│   ├── biome.json
│   └── src/
│       ├── index.ts
│       ├── app.ts
│       └── config/
│           └── env.ts
└── complete/                    # 模範解答
    └── （backendと同じ構造で、全実装済み）
```

### ブランチ/タグ戦略

```
main           → backend/ の状態（スタート地点）
chapter/1      → 第1章完了時点
chapter/2      → 第2章完了時点
chapter/3      → 第3章完了時点
chapter/4      → 第4章完了時点
chapter/5      → 第5章完了時点
chapter/6      → 第6章完了時点
chapter/7      → 第7章完了時点（= complete）
```

---

## 技術スタック

### バックエンド（チュートリアル本体）

| カテゴリ | 技術 | バージョン目安 |
|---------|------|---------------|
| Runtime | Node.js | v22 |
| 言語 | TypeScript | ^5.7.0 |
| フレームワーク | Express | ^5.1.0 |
| バリデーション | Zod | ^3.25.0 |
| ORM | Prisma | ^6.0.0 |
| DB | SQLite | - |
| テスト | Vitest | ^3.1.0 |
| APIテスト | supertest | ^7.0.0 |
| Lint/Format | Biome | ^1.9.0 |
| 開発サーバー | tsx | ^4.19.0 |

### フロントエンド（配布用SPA）

| カテゴリ | 技術 | バージョン目安 |
|---------|------|---------------|
| ビルドツール | Vite | ^6.0.0 |
| UIライブラリ | React | ^19.0.0 |
| データフェッチ | TanStack Query | ^5.0.0 |
| スタイリング | Tailwind CSS | v4 |

---

## API仕様

### ベースURL

```
http://localhost:3000/api
```

### ToDo エンティティ

```typescript
type Todo = {
  id: string;          // UUID
  title: string;
  completed: boolean;
  createdAt: string;   // ISO8601
  updatedAt: string;   // ISO8601
}
```

### エンドポイント

#### GET /api/todos

一覧取得（フィルタ対応）

**Query Parameters**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| completed | "true" \| "false" | No | 完了状態でフィルタ |

**例**
```
GET /api/todos                    → 全件取得
GET /api/todos?completed=true     → 完了済みのみ
GET /api/todos?completed=false    → 未完了のみ
```

**Response 200 OK**
```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "牛乳を買う",
      "completed": false,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error 400 Bad Request**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "completed must be 'true' or 'false'"
  }
}
```

---

#### POST /api/todos

新規作成

**Request Body**
```json
{
  "title": "牛乳を買う"
}
```

**Response 201 Created**
```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "牛乳を買う",
    "completed": false,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error 400 Bad Request**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required"
  }
}
```

---

#### GET /api/todos/:id

単体取得

**Response 200 OK**
```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "牛乳を買う",
    "completed": false,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error 404 Not Found**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Todo not found"
  }
}
```

---

#### PATCH /api/todos/:id

更新（部分更新）

**Request Body**（全フィールドoptional）
```json
{
  "title": "低脂肪牛乳を買う",
  "completed": true
}
```

**Response 200 OK**
```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "低脂肪牛乳を買う",
    "completed": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error 404 Not Found / 400 Bad Request**

---

#### DELETE /api/todos/:id

削除

**Response 204 No Content**

（レスポンスボディなし）

**Error 404 Not Found**

---

### 共通エラーレスポンス形式

```typescript
type ErrorResponse = {
  error: {
    code: string;
    message: string;
  }
}
```

| code | 意味 |
|------|------|
| VALIDATION_ERROR | バリデーションエラー |
| NOT_FOUND | リソースが存在しない |
| INTERNAL_ERROR | サーバー内部エラー |

---

## Backend 詳細

### package.json

```json
{
  "name": "todo-api",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "biome check src",
    "lint:fix": "biome check --write src",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^5.1.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.1.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### src/index.ts（最小スタート）

```typescript
const port = process.env.PORT || 3000;

console.log(`TODO: サーバーを ${port} で起動する`);
```

### src/app.ts（最小スタート）

```typescript
import express from 'express';

const app = express();

// TODO: ミドルウェアとルーティングを設定する

export { app };
```

### ディレクトリの役割

| ディレクトリ | 役割 | 導入章 |
|-------------|------|--------|
| routes/ | ルーティング定義 | 第2章 |
| controllers/ | リクエスト/レスポンス処理 | 第2章 |
| services/ | ビジネスロジック | 第3章（インメモリ）→ 第4章（Prisma） |
| middleware/ | エラーハンドリング等 | 第2章 |
| types/ | 型定義（受講者が自分で書く） | 第3章 |
| prisma/ | スキーマ・マイグレーション | 第4章 |
| tests/ | テストコード | 第5章 |

---

## フロントエンドSPA 詳細

### 技術構成

- Vite + React 19
- TanStack Query（データフェッチ）
- Tailwind CSS v4（スタイリング）

### 機能

- ToDo一覧表示
- 新規作成（フォーム）
- 完了/未完了の切り替え（チェックボックス）
- 削除
- フィルタ（全て / 完了 / 未完了）

### 画面イメージ

```
┌─────────────────────────────────────────┐
│  📝 ToDo App                            │
├─────────────────────────────────────────┤
│  ┌─────────────────────────┐  [追加]    │
│  │ 新しいタスクを入力...    │            │
│  └─────────────────────────┘            │
│                                         │
│  [全て] [未完了] [完了済み]              │
│                                         │
│  ☐ 牛乳を買う                    [削除] │
│  ☑ TypeScriptの勉強             [削除]  │
│  ☐ APIチュートリアル作成         [削除] │
│                                         │
└─────────────────────────────────────────┘
```

### UI仕様

- エラー表示: インライン表示
- ローディング: スピナー

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

---

## チュートリアル本文 アウトライン

### 00. はじめに (00-introduction.md)

- このチュートリアルのゴール
- 前提知識（JavaScript基礎、Git基礎）
- 作るもの（ToDo API）の概要
- SPAとの接続イメージ
- リポジトリの使い方（テンプレートから作成→各章のブランチ参照）

---

### 01. プロジェクトセットアップ (01-setup.md)

**学習目標**
- Node.js + TypeScript + ESM の構成を理解する
- 開発ツールの役割を知る

**内容**
1. Node.js のバージョン確認（v22推奨）
2. `npm init` から始める
3. TypeScript 導入と `tsconfig.json` の解説
4. ESM (`"type": "module"`) の説明
5. tsx で開発サーバー起動
6. Biome のセットアップ
7. 環境変数と `.env`

**ハンズオン**
- `npm run dev` で "Hello World" がコンソールに出る状態まで

**章末チェックリスト**
- [ ] `npm run dev` でサーバーが起動する
- [ ] `npm run lint` が通る

**コラム**
- CommonJS vs ESM：なぜ今ESMなのか
- なぜtsx？ts-nodeとの違い

---

### 02. Express 基礎 (02-express-basics.md)

**学習目標**
- Express の基本概念（ルーティング、ミドルウェア）を理解する
- TypeScript での型付けを学ぶ

**内容**
1. Express とは何か（軽く）
2. `app.ts` と `index.ts` の分離（テスタビリティのため）
3. 基本的なルーティング（`app.get`, `app.post` など）
4. Request / Response の型
5. ミドルウェアの仕組み
   - `express.json()`
   - カスタムミドルウェア（ログ出力）
6. エラーハンドリングミドルウェア
7. CORS設定（フロントと繋ぐ準備）

**ハンズオン**
- `GET /health` → `{ "status": "ok" }` を返すエンドポイント作成
- リクエストログを出すミドルウェア作成

**章末チェックリスト**
- [ ] `GET /health` が動く
- [ ] リクエストごとにログが出る
- [ ] 存在しないパスに404が返る

**コラム**
- app.ts と index.ts を分ける理由
- Express 5 で何が変わったか

---

### 03. REST API 設計と実装 (03-todo-api.md)

**学習目標**
- RESTful な設計を理解する
- Zodでバリデーションを行う
- 型定義をAPI仕様から起こす

**内容**
1. REST とは（GET/POST/PATCH/DELETE の意味）
2. API仕様書の読み方
3. 型定義を書く（`types/todo.ts`）
4. Zod スキーマの定義
5. Controller の実装
6. Service 層（インメモリ版）
   - `Map<string, Todo>` で仮実装
   - UUID生成（`crypto.randomUUID()`）
7. ルーティング設定
8. クエリパラメータの扱い（`?completed=true`）
9. SPAと接続して動作確認

**ハンズオン**
- 全エンドポイント実装（インメモリ）
- フロントエンドと繋いで動作確認

**章末チェックリスト**
- [ ] 全CRUDエンドポイントが動く
- [ ] バリデーションエラーが正しく返る
- [ ] フィルタが動作する
- [ ] SPAから操作できる

**コラム**
- PUT vs PATCH：どっちを使う？
- なぜレスポンスをオブジェクトでラップするのか
- Zodを使う理由：型とバリデーションの二重管理問題

---

### 04. Prisma でデータ永続化 (04-prisma.md)

**学習目標**
- ORMの役割を理解する
- Prismaの基本操作を習得する

**内容**
1. なぜDBが必要か（インメモリの限界）
2. Prisma とは
3. セットアップと初期化
4. `schema.prisma` の書き方
5. マイグレーション
6. Prisma Client の使い方
7. Service層の書き換え（インメモリ → Prisma）
8. 動作確認（データが永続化されることを確認）

**ハンズオン**
- Prisma導入してService層を置き換え
- サーバー再起動してもデータが残ることを確認

**章末チェックリスト**
- [ ] `npx prisma migrate dev` が成功する
- [ ] 全エンドポイントが引き続き動く
- [ ] 再起動後もデータが残っている

**コラム**
- ORMを使う派 vs 生SQL派
- マイグレーションの重要性
- なぜSQLiteで始めるのか

---

### 05. テスト (05-testing.md)

**学習目標**
- ユニットテストの書き方を学ぶ
- モックの使い方を理解する

**内容**
1. なぜテストを書くのか
2. Vitest のセットアップ
3. テストの構造（describe / it / expect）
4. Service層のユニットテスト
   - Prismaのモック（`vi.mock`）
5. APIテスト（supertest）
6. カバレッジの見方
7. CI で回す話（予告）

**ハンズオン**
- Service層のテストを書く
- APIのインテグレーションテストを書く

**章末チェックリスト**
- [ ] `npm test` が通る
- [ ] カバレッジレポートが出る

**コラム**
- 何をテストすべきか：テストピラミッドの話
- モックしすぎ問題
- TDD は必須か？

---

### 06. Docker化 (06-docker.md)

**学習目標**
- Dockerの基本概念を理解する
- アプリケーションをコンテナ化できる

**内容**
1. なぜDockerか
2. Dockerfile の基本構文
3. マルチステージビルド
4. `.dockerignore`
5. docker-compose でローカル開発
6. イメージサイズの最適化

**ハンズオン**
- Dockerfile作成
- `docker compose up` で起動確認

**章末チェックリスト**
- [ ] `docker build` が成功する
- [ ] `docker compose up` でAPIが動く

**コラム**
- なぜマルチステージビルドか
- Alpineイメージの罠

---

### 07. Cloud Run へデプロイ (07-cloud-run.md)

**学習目標**
- クラウドへのデプロイを経験する
- 本番環境の考慮点を知る

**内容**
1. Cloud Run とは
2. GCPプロジェクト作成
3. gcloud CLI セットアップ
4. Artifact Registry へのプッシュ
5. Cloud Run へデプロイ
6. 環境変数の設定
7. 本番URLで動作確認
8. 後片付け（課金を止める）

**ハンズオン**
- 実際にデプロイして公開URLでアクセス

**章末チェックリスト**
- [ ] Cloud Run にデプロイできた
- [ ] 公開URLでAPIが動く

**コラム**
- サーバーレス vs 常時起動
- 本番環境の環境変数管理

---

## コラム一覧

### 第1章

| タイトル | 内容 |
|---------|------|
| CommonJS vs ESM：なぜ今ESMなのか | 歴史的経緯、Node.jsがESMをサポートするまでの流れ、`"type": "module"` の意味 |
| なぜtsx？ts-nodeとの違い | esbuildベースで高速、設定不要、開発体験の違い |

### 第2章

| タイトル | 内容 |
|---------|------|
| app.ts と index.ts を分ける理由 | テスト時に `app` だけimportしたい、サーバー起動のタイミング制御 |
| Express 5 で何が変わったか | async/awaitのエラーが自動でキャッチされる話、v4からの移行 |

### 第3章

| タイトル | 内容 |
|---------|------|
| PUT vs PATCH：どっちを使う？ | 全置換 vs 部分更新、実務ではPATCHが多い理由 |
| なぜレスポンスをオブジェクトでラップするのか | 配列直返しの罠（後から `totalCount` 足せない）、拡張性の話 |
| Zodを使う理由：型とバリデーションの二重管理問題 | TypeScriptの型はランタイムで消える、Zodで両方カバーできる |

### 第4章

| タイトル | 内容 |
|---------|------|
| ORMを使う派 vs 生SQL派 | それぞれのメリデメ、チーム規模や案件による使い分け |
| マイグレーションの重要性 | 本番DBを直接いじってはいけない理由、チーム開発での衝突 |
| なぜSQLiteで始めるのか | 開発時の手軽さ、本番はPostgreSQLに差し替えやすい設計 |

### 第5章

| タイトル | 内容 |
|---------|------|
| 何をテストすべきか：テストピラミッドの話 | ユニット/インテグレーション/E2Eのバランス |
| モックしすぎ問題 | 何でもモックすると「テストは通るけど本番で壊れる」現象 |
| TDD は必須か？ | TDDの理想と現実、最低限カバーすべきライン |

### 第6章

| タイトル | 内容 |
|---------|------|
| なぜマルチステージビルドか | イメージサイズ削減、devDependenciesを本番に持ち込まない |
| Alpineイメージの罠 | 軽いけど glibc 互換問題でハマることがある、distroless という選択肢 |

### 第7章

| タイトル | 内容 |
|---------|------|
| サーバーレス vs 常時起動 | コールドスタート、料金体系、どんなアプリに向いてるか |
| 本番環境の環境変数管理 | Secret Manager の存在、`.env` を本番で使ってはいけない理由 |

---

## コラムのフォーマット

GitHub Markdown用:

```markdown
> 📝 **コラム：タイトル**
>
> 本文をここに書く。200〜400字程度を目安に。
```

---

## 実装順序

Claude Codeでの実装は以下の順序で進める：

### Phase 1: Backend

1. `backend/` ディレクトリを作成
2. `package.json`, `tsconfig.json`, `biome.json` を作成
3. 最小限の `src/index.ts`, `src/app.ts`, `src/config/env.ts` を作成
4. `.env.example`, `.gitignore` を作成
5. 動作確認（`npm run dev` で起動）

### Phase 2: フロントエンドSPA

1. `frontend/` ディレクトリを作成
2. Vite + React + TanStack Query + Tailwind をセットアップ
3. コンポーネント実装
   - TodoList
   - TodoItem
   - TodoForm
   - TodoFilter
4. API接続フック実装（useTodos）
5. ビルドして `dist/` に出力
6. 動作確認（モックAPIまたは完成版APIと接続）

### Phase 3: Complete（模範解答）

1. `complete/` ディレクトリを作成（backendをコピー）
2. 第1章〜第7章の実装を順番に追加
3. 各章完了時点でタグ/ブランチを切る

### Phase 4: ドキュメント

1. `docs/api-spec.md` を作成
2. `docs/00-introduction.md` 〜 `docs/07-cloud-run.md` を作成
3. `README.md` を作成

---

## 注意事項

- 各章で必要になったタイミングで受講者自身がディレクトリを作成する（.gitkeepは使用しない）
- 型定義（`types/todo.ts`）は受講者が第3章で自分で作成する
- 認証は今回のスコープ外
- ページネーションは不要
- 追加課題は不要
- コラムは各章に含める（上記一覧参照）

---

## 参考

このチュートリアルは「ハンズオンNode.js」（オライリー、2020年）の第5, 7, 8, 9章をベースに、2025年の技術スタックでリライトしたもの。

