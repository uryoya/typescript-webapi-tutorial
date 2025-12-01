# 第7章：Cloud Run へデプロイ

## 学習目標

- クラウドへのデプロイを経験する
- 本番環境の考慮点を知る

## Cloud Run とは

**Cloud Run** は、Google Cloud のサーバーレスコンテナプラットフォームです。

主な特徴：
- **自動スケーリング**（0 から数千インスタンスまで）
- **従量課金**（使った分だけ）
- **HTTPS 自動対応**
- **簡単デプロイ**

## 前提条件

- Google Cloud アカウント
- gcloud CLI のインストール

### gcloud CLI のインストール

[公式サイト](https://cloud.google.com/sdk/docs/install) からインストールしてください。

インストール後、ログインします：

```bash
gcloud auth login
```

## GCP プロジェクトの作成

### 1. プロジェクトを作成

```bash
gcloud projects create my-todo-api --name="Todo API"
```

### 2. プロジェクトを選択

```bash
gcloud config set project my-todo-api
```

### 3. 課金アカウントを有効化

Google Cloud Console で課金アカウントを設定してください。

**注意：** 無料枠を超えると課金が発生します。

## 必要な API を有効化

```bash
# Cloud Run API
gcloud services enable run.googleapis.com

# Artifact Registry API（コンテナレジストリ）
gcloud services enable artifactregistry.googleapis.com

# Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

## Artifact Registry へのプッシュ

### 1. リポジトリを作成

```bash
gcloud artifacts repositories create todo-api \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Todo API container images"
```

### 2. Docker の認証設定

```bash
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

### 3. イメージにタグを付ける

```bash
docker tag todo-api \
  asia-northeast1-docker.pkg.dev/my-todo-api/todo-api/app:latest
```

### 4. イメージをプッシュ

```bash
docker push \
  asia-northeast1-docker.pkg.dev/my-todo-api/todo-api/app:latest
```

## Cloud Run へデプロイ

```bash
gcloud run deploy todo-api \
  --image=asia-northeast1-docker.pkg.dev/my-todo-api/todo-api/app:latest \
  --platform=managed \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=file:./prod.db"
```

オプションの説明：
- `--platform=managed` - フルマネージド
- `--region=asia-northeast1` - 東京リージョン
- `--allow-unauthenticated` - 認証なしでアクセス可能
- `--set-env-vars` - 環境変数の設定

デプロイが完了すると、URL が表示されます：

```
Service [todo-api] revision [todo-api-00001-abc] has been deployed and is serving 100 percent of traffic.
Service URL: https://todo-api-xyz123-an.a.run.app
```

## 動作確認

```bash
curl https://todo-api-xyz123-an.a.run.app/health
```

```json
{"status":"ok"}
```

成功です！

## 環境変数の更新

環境変数を更新する場合：

```bash
gcloud run services update todo-api \
  --region=asia-northeast1 \
  --set-env-vars="DATABASE_URL=postgresql://..."
```

本番環境では、**Secret Manager** を使うことを強く推奨します：

```bash
gcloud run services update todo-api \
  --region=asia-northeast1 \
  --update-secrets=DATABASE_URL=database-url:latest
```

## ログの確認

```bash
gcloud run services logs read todo-api \
  --region=asia-northeast1 \
  --limit=50
```

または、[Cloud Console](https://console.cloud.google.com/) の Logs Explorer で確認できます。

## 後片付け（課金を止める）

### サービスの削除

```bash
gcloud run services delete todo-api --region=asia-northeast1
```

### Artifact Registry のリポジトリ削除

```bash
gcloud artifacts repositories delete todo-api --location=asia-northeast1
```

### プロジェクト全体の削除

```bash
gcloud projects delete my-todo-api
```

**注意：** プロジェクトを削除すると、すべてのリソースが削除されます。

## 章末チェックリスト

以下の項目を確認してください：

- [ ] Cloud Run にデプロイできた
- [ ] 公開 URL で API が動く
- [ ] ログが確認できる
- [ ] 後片付けの方法を理解した

すべて確認できたら、チュートリアル完了です！おめでとうございます！

---

## コラム

> 📝 **コラム：サーバーレス vs 常時起動**
>
> Cloud Run はサーバーレスで、アクセスがない時はインスタンスが 0 になります（コールドスタート）。初回アクセスが遅くなる場合がありますが、**最小インスタンス数を設定**することで回避できます。料金体系も異なるため、アプリの性質に応じて選択しましょう。

> 📝 **コラム：本番環境の環境変数管理**
>
> `.env` ファイルを本番で使うのは危険です。**Secret Manager** などのシークレット管理サービスを使い、環境変数を安全に管理しましょう。Git にシークレットをコミットしないことも重要です。
