# 第6章：Docker化

## 学習目標

- Docker の基本概念を理解する
- アプリケーションをコンテナ化できる

## なぜ Docker か

**Docker** を使うことで：
- **環境の違いを吸収**できる（"私の環境では動くのに..." を解決）
- **デプロイが簡単**になる
- **スケーラブル**な運用ができる

## Dockerfile の作成

プロジェクトルートに `Dockerfile` を作成します：

```dockerfile
# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:22-alpine AS deps

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 本番用の依存関係のみインストール
RUN npm ci --omit=dev

# ========================================
# Stage 2: Builder
# ========================================
FROM node:22-alpine AS builder

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 全依存関係をインストール（devDependencies 含む）
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScript をビルド
RUN npm run build

# ========================================
# Stage 3: Runner
# ========================================
FROM node:22-alpine AS runner

WORKDIR /app

# 本番環境であることを明示
ENV NODE_ENV=production

# 本番用の依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules

# ビルド成果物をコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 非 root ユーザーを作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### マルチステージビルドとは

マルチステージビルドを使うことで：
- **イメージサイズを削減**できる
- **devDependencies を本番に含めない**
- **セキュリティが向上**する

## .dockerignore の作成

`.dockerignore` を作成して、不要なファイルを除外します：

```
node_modules
dist
.env
.env.local
*.db
*.db-journal
.git
.gitignore
README.md
docs
frontend
tests
coverage
npm-debug.log
```

## Docker イメージのビルド

```bash
docker build -t todo-api .
```

- `-t todo-api` - イメージ名を指定

ビルドには数分かかります。完了したら、イメージを確認：

```bash
docker images
```

```
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
todo-api     latest    abc123def456   1 minute ago     150MB
```

## Docker コンテナの実行

```bash
docker run -p 3000:3000 todo-api
```

- `-p 3000:3000` - ポートマッピング（ホスト:コンテナ）

ブラウザで `http://localhost:3000/health` にアクセスして確認してください。

## docker-compose でローカル開発

`docker-compose.yml` を作成します：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=development
      - DATABASE_URL=file:./dev.db
    volumes:
      - ./dev.db:/app/dev.db
    restart: unless-stopped
```

### docker-compose の起動

```bash
docker compose up
```

- `-d` オプションでバックグラウンド実行

### docker-compose の停止

```bash
docker compose down
```

## イメージサイズの確認

```bash
docker images todo-api
```

マルチステージビルドを使わない場合、イメージサイズは 500MB を超えることもありますが、マルチステージビルドを使うことで **150MB 程度**に抑えられます。

## 章末チェックリスト

以下の項目を確認してください：

- [ ] `docker build` が成功する
- [ ] `docker run` でコンテナが起動する
- [ ] `docker compose up` で API が動く
- [ ] イメージサイズが 200MB 以下

すべて確認できたら、[第7章 Cloud Run へデプロイ](./07-cloud-run.md) に進みましょう！

---

## コラム

> 📝 **コラム：なぜマルチステージビルドか**
>
> マルチステージビルドは、ビルド時に必要なツール（TypeScript コンパイラなど）を最終イメージに含めないための手法です。これにより、イメージサイズが大幅に削減され、セキュリティも向上します。devDependencies を本番に持ち込まないことで、攻撃面を減らせます。

> 📝 **コラム：Alpine イメージの罠**
>
> Alpine Linux は軽量ですが、glibc の代わりに musl libc を使っているため、一部のネイティブモジュールで互換性問題が発生することがあります。その場合は、`node:22-slim` などの代替イメージを検討してください。また、**distroless** イメージという選択肢もあります。
