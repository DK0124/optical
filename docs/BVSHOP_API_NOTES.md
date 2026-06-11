# BVSHOP API Notes

## 顧客 API

### 取得顧客資料

```http
GET /customers/{id}
Accept: application/json
Authorization: Bearer <token>
```

回傳主要欄位：

```json
{
  "data": {
    "id": 269,
    "fullName": "王小明",
    "email": "test@example.com",
    "phone": "0912345678",
    "city": "",
    "address": "",
    "dealerCode": null,
    "relateOrders": []
  }
}
```

### 建立顧客

```http
POST /customers
```

必填：

- `phone`
- `fullName`
- `email`
- `address`

### 更新顧客

```http
PUT /customers/{id}
```

可更新：

- `phone`
- `fullName`
- `email`
- `address`
- `dealerCode`

## 重要限制

BVSHOP 顧客 API 目前沒有顧客備註欄位，因此完整驗光資料應存在本系統 D1。

---

## 訂單 API

### 取得訂單列表

```http
GET /orders
```

常用 query：

- `customerId`
- `orderStatus`
- `paymentStatus`
- `logisticStatus`
- `dateType`
- `startAt`
- `endAt`
- `limit`
- `page`
- `withDetail`

### 取得訂單資料

```http
GET /orders/{id}
```

回傳內含：

- `id`
- `uid`
- `customerId`
- `orderItems`
- `customizeItems`
- `remark`
- `cvs`
- `invoice`

### 新增訂單

```http
POST /orders
```

核心欄位：

```json
{
  "customerId": 1,
  "paymentId": 1,
  "logisticId": 1,
  "remark": "訂單備註",
  "customizeItems": [
    { "name": "鏡框", "quantity": 1, "price": 3500 }
  ],
  "customizeSales": [],
  "cvs": {
    "storeName": "門市自取",
    "storeNum": "0000"
  }
}
```

文件顯示 required 包含：

- `customerId`
- `paymentId`
- `logisticId`
- `remark`
- `customizeItems`
- `cvs`

因此 MVP 第一階段先做「payload preview」，不要預設直接建立真訂單。

### 更新訂單

```http
PUT /orders/{id}
```

可用於更新 `remark`。同步 BVSHOP 訂單備註時，務必先取得原訂單資料再更新，避免覆蓋人工備註。
