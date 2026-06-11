# SETUP_GUIDE.md — 安裝與實測指引

本文件說明如何在本機安裝、設定、啟動，並一條龍完成第一階段手動測試。

---

## 1. 環境需求

| 工具 | 版本需求 |
|------|---------|
| Node.js | ≥ 18 |
| pnpm | ≥ 8 |
| wrangler | ≥ 3（已含在 devDependencies） |

---

## 2. 安裝

```bash
# Clone 後進入目錄
cd optical

# 安裝所有 workspace 套件
pnpm install --no-frozen-lockfile
```

---

## 3. 設定環境變數

### 後端（`apps/api/.dev.vars`）

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

開啟 `apps/api/.dev.vars`，依需求填入：

```ini
# 必填：BVSHOP API（第一階段只測本機驗光/配鏡可先留 placeholder）
BVSHOP_API_BASE_URL=https://YOUR_BVSHOP_API_BASE_URL/api/v2
BVSHOP_API_TOKEN=PASTE_YOUR_TOKEN_HERE

# 公司 ID（本機測試維持預設即可）
DEFAULT_COMPANY_ID=COMPANY_DEFAULT

# 建單預設值（確認後再改）
DEFAULT_PAYMENT_ID=1
DEFAULT_LOGISTIC_ID=1
DEFAULT_CVS_STORE_NAME=門市自取
DEFAULT_CVS_STORE_NUM=0000

# 認證開關：本機測試設 false（不需 Cloudflare Access）
REQUIRE_AUTH=false

# 真建單開關：確認所有設定後再改 true（第二階段）
ENABLE_REAL_ORDER=false
```

### 後端 `wrangler.toml`（本機開發）

```bash
cp apps/api/wrangler.toml.example apps/api/wrangler.toml
```

> D1 database_id 本機開發不需填入真實 ID，`wrangler dev` 會自動使用本機 SQLite。
> `wrangler.toml.example` 已預設 `migrations_dir = "../../migrations"`，可正確指向根目錄 migration。

---

## 4. 建立本機 D1 並套用 migration

```bash
# 套用 migration（建立所有資料表）
pnpm --filter @optical/api db:local
```

完成後會在 `.wrangler/state/v3/d1/` 看到本機 SQLite 資料庫。

---

## 5. 啟動服務

### 後端（port 8787）

```bash
pnpm dev:api
```

### 前端（port 5173）

```bash
pnpm dev:web
```

> Vite 已設定 proxy，`/api` 路徑自動轉至 `http://localhost:8787`。
> 開啟瀏覽器：http://localhost:5173

---

## 6. 哪些功能不需要真 BVSHOP Token

| 功能 | 需要 Token | 說明 |
|------|-----------|------|
| `GET /api/health` | ❌ | 直接可用 |
| 新增驗光紀錄 | ❌ | 只寫本機 D1 |
| 查看驗光 | ❌ | 只讀本機 D1 |
| 建立配鏡紀錄 | ❌ | 只寫本機 D1 |
| 檢視訂單備註 | ❌ | 從本機 D1 產生 |
| Payload 預覽 | ❌ | 從本機 D1 產生 |
| 查詢 BVSHOP 顧客（電話/Email） | ✅ | 需真 Token |
| 查詢顧客（姓名） | ❌ | 走本機 `customers_snapshot` 快照 |
| 建立 BVSHOP 顧客 | ✅ | 需真 Token |
| 真建單（第二階段）| ✅ | 需真 Token + `ENABLE_REAL_ORDER=true` |

---

## 7. 一條龍手動測試腳本

以下步驟可在**不需要真 BVSHOP Token** 的情況下完成完整流程。

### 步驟 A：確認 health

```bash
curl http://localhost:8787/api/health \
  -H "x-dev-user-email: dev@example.com"
# 期望: {"ok":true,"service":"optical-api","time":"..."}
```

### 步驟 B：手動塞一筆顧客快照（跳過 BVSHOP 查詢）

```bash
pnpm --filter @optical/api exec wrangler d1 execute optical-mvp --local --command \
  "INSERT INTO customers_snapshot (id, company_id, bvshop_customer_id, full_name, phone, email, address, created_at, updated_at) VALUES ('COMPANY_DEFAULT:TEST001', 'COMPANY_DEFAULT', 'TEST001', '測試顧客', '0912345678', 'test@example.com', '台北市', datetime('now'), datetime('now'));"
```

瀏覽器開啟：http://localhost:5173/customers/TEST001

### 步驟 C：新增驗光紀錄

```bash
curl -s -X POST http://localhost:8787/api/optometry-records \
  -H "Content-Type: application/json" \
  -H "x-dev-user-email: dev@example.com" \
  -d '{
    "bvshopCustomerId": "TEST001",
    "examDate": "2026-06-11",
    "staffName": "王小明",
    "dominantEye": "right",
    "purpose": "daily",
    "right": {"sph": -5.25, "cyl": -0.5, "axis": 22, "pd": 27.5},
    "left":  {"sph": -3.5,  "cyl": -0.5, "axis": 150, "pd": 26},
    "note": "初次驗光"
  }'
```

記下回傳的 `data.id`（例：`OP-20260611-XXXXXXXX`），以下稱 `$OP_ID`。

### 步驟 D：查看驗光歷史

```bash
curl http://localhost:8787/api/customers/TEST001/optometry-records \
  -H "x-dev-user-email: dev@example.com"
```

瀏覽器：http://localhost:5173/customers/TEST001 → 驗光紀錄 Tab

### 步驟 E：由驗光建立配鏡

```bash
curl -s -X POST http://localhost:8787/api/glasses-orders \
  -H "Content-Type: application/json" \
  -H "x-dev-user-email: dev@example.com" \
  -d '{
    "optometryRecordId": "OP-20260611-XXXXXXXX",
    "bvshopCustomerId": "TEST001",
    "orderDate": "2026-06-11",
    "prescription": {
      "right": {"sph": -5.25, "cyl": -0.5, "axis": 22, "pd": 27.5},
      "left":  {"sph": -3.5,  "cyl": -0.5, "axis": 150, "pd": 26}
    },
    "frame": {"brand": "愛視爾", "model": "SUI161", "price": 3500},
    "lens":  {"type": "single_vision", "index": "1.67", "coating": ["blue_cut","anti_reflection"], "price": 0},
    "amount": {"discount": 0, "total": 3500, "deposit": 1000, "balance": 2500},
    "note": "依本次驗光配鏡"
  }'
```

記下 `data.id`，以下稱 `$GO_ID`。

### 步驟 F：查看訂單備註並複製

```bash
curl http://localhost:8787/api/glasses-orders/$GO_ID/order-note \
  -H "x-dev-user-email: dev@example.com"
```

瀏覽器：http://localhost:5173/glasses-orders/$GO_ID → 點擊「📋 複製備註」

### 步驟 G：查看建單 Payload 預覽

```bash
curl http://localhost:8787/api/glasses-orders/$GO_ID/bvshop-payload-preview \
  -H "x-dev-user-email: dev@example.com"
```

或在配鏡詳情頁展開「建單 Payload 預覽」區塊。

---

## 8. 需要真 BVSHOP Token 的測試

確認 `.dev.vars` 填入真實 Token 後：

### 查詢 BVSHOP 顧客

```bash
curl "http://localhost:8787/api/customers/search?q=400000161" \
  -H "x-dev-user-email: dev@example.com"
```

### 建立 BVSHOP 顧客

```bash
curl -X POST http://localhost:8787/api/customers \
  -H "Content-Type: application/json" \
  -H "x-dev-user-email: dev@example.com" \
  -d '{
    "phone": "0912345678",
    "fullName": "新顧客",
    "email": "new@example.com",
    "address": "台北市信義區"
  }'
```

---

## 9. 部署到 Cloudflare（正式環境）

### 建立 D1 資料庫

```bash
cd apps/api
wrangler d1 create optical-mvp
```

把回傳的 `database_id` 放到 `wrangler.toml`。

### 套用 migration（正式）

```bash
pnpm --filter @optical/api db:remote
```

### 設定 Secrets

```bash
wrangler secret put BVSHOP_API_TOKEN
wrangler secret put BVSHOP_API_BASE_URL
wrangler secret put DEFAULT_COMPANY_ID
```

### 部署

```bash
pnpm --filter @optical/api deploy
```

---

## 10. 已知限制

1. **顧客查詢/建立**需要真 BVSHOP Token；無 Token 時後端回傳友善訊息，不 500。
2. **真建單**預設關閉（`ENABLE_REAL_ORDER=false`），呼叫 `POST .../create-bvshop-order` 回 403。需確認 `paymentId`/`logisticId`/`cvs` 正確後設 `ENABLE_REAL_ORDER=true`。
3. **Cloudflare Access** 在本機不啟用，以 `x-dev-user-email` header 模擬；部署後自動帶 `Cf-Access-Authenticated-User-Email`。
4. D1 Migration 目前只有 `0001_init.sql`，後續 schema 變更請在 `migrations/` 新增 SQL 檔。
5. 電話/Email 在前端列表以遮罩顯示（`0912***678`），顧客詳情頁才顯示遮罩版本。
