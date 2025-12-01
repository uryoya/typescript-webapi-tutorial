# 第1章：プロジェクトセットアップ

## 学習目標

- Node.js + TypeScript + ESM の構成を理解する
- 開発ツールの役割を知る

## Node.js のバージョン確認

まず、Node.js がインストールされていることを確認しましょう。

```bash
node --version
```

**v22 以降**を推奨します。もし古いバージョンの場合は、[Node.js 公式サイト](https://nodejs.org/)から最新の LTS 版をインストールしてください。

## プロジェクトの初期化

`backend/` ディレクトリに移動して、既に用意されている設定ファイルを確認します。

```bash
cd backend
ls
```

以下のファイルが既に用意されています：

- `package.json` - プロジェクトの設定とパッケージ管理
- `tsconfig.json` - TypeScript の設定
- `biome.json` - Linter/Formatter の設定
- `.env.example` - 環境変数のサンプル
- `.gitignore` - Git の除外設定

### 依存パッケージのインストール

```bash
npm install
```

これで、`package.json` に記載されたすべてのパッケージがインストールされます。

## TypeScript の設定

`tsconfig.json` を開いて、設定内容を確認しましょう。

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

### 重要な設定項目

- **`target: "ES2022"`** - 出力する JavaScript のバージョン
- **`module: "NodeNext"`** - ESM (ES Modules) を使用
- **`strict: true`** - 厳格な型チェックを有効化
- **`outDir`** - ビルド後の出力先
- **`rootDir`** - ソースコードのルート

## ESM (ES Modules) について

このプロジェクトでは **ESM (ES Modules)** を使用します。

`package.json` に以下の記述があることを確認してください：

```json
{
  "type": "module"
}
```

この設定により、以下のような import/export 構文が使えます：

```typescript
// ❌ CommonJS (古い書き方)
const express = require('express');
module.exports = app;

// ✅ ESM (今回使う書き方)
import express from 'express';
export { app };
```

**注意点：** ESM では、`.js` 拡張子を明示的に書く必要があります。

```typescript
// ✅ 正しい
import { env } from './config/env.js';

// ❌ 間違い（実行時エラーになる）
import { env } from './config/env';
```

TypeScript でも `.js` と書きます（`.ts` ではありません）。TypeScript がビルド時に正しく解決してくれます。

## 開発サーバーの起動

`tsx` を使って開発サーバーを起動します。

```bash
npm run dev
```

以下のように表示されれば成功です：

```
TODO: サーバーを 3000 で起動する
```

`Ctrl + C` で停止できます。

### tsx とは？

**tsx** は TypeScript を直接実行できるツールです。

- esbuild ベースで**高速**
- 設定ファイル不要
- ファイル変更を検知して自動再起動（`tsx watch`）

`package.json` の `scripts` を見てみましょう：

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- **`npm run dev`** - 開発時に使用（自動再起動）
- **`npm run build`** - TypeScript をビルドして JavaScript に変換
- **`npm run start`** - ビルド後の JavaScript を実行（本番用）

## Biome のセットアップ

**Biome** は、Linter（コード品質チェック）と Formatter（コード整形）を兼ね備えたツールです。

設定ファイル `biome.json` を確認してみましょう：

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### Lint の実行

```bash
npm run lint
```

エラーが見つかった場合は、自動修正も可能です：

```bash
npm run lint:fix
```

## 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成します。

```bash
cp .env.example .env
```

`.env` の内容：

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (will be configured in Chapter 4)
# DATABASE_URL="file:./dev.db"
```

環境変数は `src/config/env.ts` で読み込みます：

```typescript
export const env = {
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
```

## ハンズオン：Hello World を出力する

`src/index.ts` を以下のように書き換えてみましょう：

```typescript
import { env } from "./config/env.js";

const port = Number.parseInt(env.PORT, 10);

console.log(`Hello World! Server will run on port ${port}`);
```

保存したら、`npm run dev` で実行してみてください。

```bash
npm run dev
```

以下のように表示されれば成功です：

```
Hello World! Server will run on port 3000
```

## 章末チェックリスト

以下の項目を確認してください：

- [ ] `node --version` で v22 以上が表示される
- [ ] `npm install` が成功する
- [ ] `npm run dev` でサーバーが起動する
- [ ] `npm run lint` が通る（エラーがない）
- [ ] `.env` ファイルが作成されている

すべて確認できたら、[第2章 Express 基礎](./02-express-basics.md) に進みましょう！

---

## コラム

> 📝 **コラム：CommonJS vs ESM：なぜ今ESMなのか**
>
> Node.js は長らく CommonJS (`require`/`module.exports`) を標準としてきました。しかし、ブラウザの標準である ES Modules (`import`/`export`) との統一を図るため、Node.js v12 から ESM のサポートが追加されました。現在では ESM が推奨され、多くの新しいライブラリも ESM を前提に開発されています。`"type": "module"` を指定することで、プロジェクト全体で ESM を使用できます。

> 📝 **コラム：なぜtsx？ts-nodeとの違い**
>
> 従来、TypeScript を直接実行するツールとして **ts-node** が広く使われていました。しかし、tsx は esbuild をベースにしており、**起動速度が圧倒的に速い**という利点があります。また、設定ファイルなしで動作するため、開発体験が向上します。ファイル変更の検知も高速で、大規模なプロジェクトでも快適に開発できます。
