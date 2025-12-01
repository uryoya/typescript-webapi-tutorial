# ToDo API 仕様書

## ベースURL

```
http://localhost:3000/api
```

## ToDo エンティティ

```typescript
type Todo = {
  id: string;          // UUID
  title: string;
  completed: boolean;
  createdAt: string;   // ISO8601
  updatedAt: string;   // ISO8601
}
```

## エンドポイント

### GET /api/todos

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

### POST /api/todos

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

### GET /api/todos/:id

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

### PATCH /api/todos/:id

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

### DELETE /api/todos/:id

削除

**Response 204 No Content**

（レスポンスボディなし）

**Error 404 Not Found**

---

## 共通エラーレスポンス形式

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
