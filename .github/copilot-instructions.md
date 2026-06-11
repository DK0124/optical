# Copilot instructions：BVSHOP 眼鏡行驗光配鏡管理系統 MVP

## 專案目標

建立一套網頁系統，讓眼鏡行可以：

1. 從 BVSHOP 查詢或建立顧客。
2. 在本系統建立與保存驗光資料。
3. 由驗光紀錄建立配鏡資料。
4. 產生 BVSHOP 訂單備註格式。
5. 第二階段可透過 BVSHOP API 建立訂單，並把配鏡摘要寫入 `remark`。

## 重要架構原則

- BVSHOP 是會員、訂單、付款、商品的主系統。
- 本系統 D1 資料庫是驗光資料、配鏡資料、操作紀錄的主系統。
- BVSHOP 目前不可讀寫顧客備註；不要把驗光資料塞到 BVSHOP 顧客資料。
- BVSHOP 訂單備註 `remark` 只放「配鏡摘要 + JSON 區塊 + 本系統驗光紀錄 ID」。
- 前端不可直接呼叫 BVSHOP API。
- BVSHOP token 只能放在 Cloudflare Worker Secret 或 `.dev.vars`，例如 `BVSHOP_API_TOKEN`。
- 所有資料表都必須有 `company_id`，即使 MVP 先只有一間公司。
- 所有修改驗光、配鏡、同步 BVSHOP 的動作都要寫入 `audit_logs`。

## BVSHOP API 重點

### 顧客

- `GET /customers/{id}`：取得顧客資料。
- `POST /customers`：建立顧客。必填 `phone`、`fullName`、`email`、`address`。
- `PUT /customers/{id}`：更新顧客。可更新 `phone`、`fullName`、`email`、`address`、`dealerCode`。
- 不要假設顧客有 `remark` 或「會員備註」欄位。

### 訂單

- `GET /orders`：取得訂單列表，可依 `customerId`、狀態、日期查詢。
- `GET /orders/{id}`：取得訂單資料，回傳內含 `remark`。
- `POST /orders`：新增訂單。核心欄位包含 `customerId`、`paymentId`、`logisticId`、`remark`、`customizeItems`、`cvs`。
- `PUT /orders/{id}`：更新訂單。可更新 `remark` 等訂單資料。
- MVP 第一階段不要直接建立真訂單，先產生「訂單備註」與「建單 payload 預覽」。

## 建議技術棧

- Frontend：React + Vite + TypeScript
- Backend：Cloudflare Workers + Hono + TypeScript
- Database：Cloudflare D1
- Auth MVP：Cloudflare Access 保護網域；Worker 端讀 `Cf-Access-Authenticated-User-Email`
- Package manager：pnpm

## Frontend pages

- `/`：首頁 / 儀表板
- `/customers/search`：查詢 BVSHOP 顧客
- `/customers/:customerId`：顧客首頁，顯示快照、驗光歷史、配鏡歷史
- `/customers/:customerId/optometry/new`：新增驗光
- `/optometry/:id`：查看 / 編輯驗光
- `/optometry/:id/create-glasses-order`：由驗光建立配鏡資料
- `/glasses-orders/:id`：查看配鏡資料與 BVSHOP 訂單備註

## Worker API

- `GET /api/health`
- `GET /api/customers/search?q=`
- `GET /api/customers/:bvshopCustomerId`
- `POST /api/customers`
- `POST /api/optometry-records`
- `GET /api/customers/:bvshopCustomerId/optometry-records`
- `PATCH /api/optometry-records/:id`
- `POST /api/glasses-orders`
- `GET /api/glasses-orders/:id`
- `GET /api/glasses-orders/:id/order-note`
- `GET /api/glasses-orders/:id/bvshop-payload-preview`
- `POST /api/glasses-orders/:id/create-bvshop-order` 第二階段才開

## 安全規則

- 不要在瀏覽器 localStorage/sessionStorage 保存 BVSHOP token。
- 不要在 console log 完整顧客電話、email、完整驗光資料。
- D1 query 一律依 `company_id` 過濾。
- 所有 BVSHOP 寫入動作前都要顯示預覽與確認。
- 未授權使用者不可讀取任何顧客或驗光資料。

## MVP 優先順序

1. D1 schema + health check。
2. 顧客 ID 查詢 BVSHOP。
3. 顧客快照 upsert。
4. 新增驗光紀錄。
5. 顯示顧客驗光歷史。
6. 由驗光建立配鏡資料。
7. 產生 BVSHOP 訂單備註。
8. 產生 BVSHOP 建單 payload 預覽。
9. 確認 payment/logistic/cvs 後，再實作真建單。
