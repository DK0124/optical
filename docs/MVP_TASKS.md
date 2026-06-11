# MVP Tasks

## Phase 1：專案骨架

- [x] pnpm workspace
- [x] apps/web React + Vite + TypeScript
- [x] apps/api Cloudflare Worker + Hono + TypeScript
- [x] packages/shared
- [x] migrations/0001_init.sql
- [x] docs

## Phase 2：後端基礎

- [x] Hono API server
- [x] `/api/health`
- [x] D1 binding 型別
- [x] auth helper（含 `REQUIRE_AUTH` 未授權擋 401，health 例外）
- [x] audit helper
- [x] bvshopClient

## Phase 3：顧客功能

- [x] `GET /api/customers/search`（BVSHOP 查無時回空陣列，不 500）
- [x] `GET /api/customers/:bvshopCustomerId`
- [x] customers_snapshot upsert
- [x] `POST /api/customers`（bvshopCustomerInputSchema zod 驗證，422）

## Phase 4：驗光功能

- [x] `POST /api/optometry-records`
- [x] `GET /api/customers/:bvshopCustomerId/optometry-records`
- [x] `GET /api/optometry-records/:id`
- [x] `PATCH /api/optometry-records/:id`（完整欄位更新，含 left/right 度數）
- [x] audit log
- [x] basic validation

## Phase 5：配鏡功能

- [x] `POST /api/glasses-orders`
- [x] `GET /api/glasses-orders/:id`
- [x] `GET /api/glasses-orders/:id/order-note`
- [x] order note generator（移至 `packages/shared`，前後端共用）
- [x] save `bvshop_remark`

## Phase 6：BVSHOP 訂單

- [x] 建單 payload preview（`GET .../bvshop-payload-preview`）
- [x] 支援付款/物流下拉（`GET /api/bvshop/payments`、`GET /api/bvshop/logistics`）
- [x] 建單前確認 paymentId/logisticId/cvs（由前端選擇並傳入）
- [x] `POST /api/glasses-orders/:id/create-bvshop-order`（`ENABLE_REAL_ORDER=false` 預設回 403）
- [x] 回寫 `bvshop_order_id` / `bvshop_order_uid`

## Phase 7：前端

- [x] App Shell（Sidebar + Topbar，RWD）
- [x] 設計系統（CSS custom properties，靛藍 + Slate 色調）
- [x] 共用元件（Badge/StatusPill, Toast, EmptyState, LoadingSpinner, AppShell）
- [x] 儀表板（`/`）
- [x] 顧客查詢頁（`/customers/search`）
- [x] 顧客詳情頁（`/customers/:customerId`，Tab 分頁）
- [x] 新增驗光頁（`/customers/:customerId/optometry/new`）
- [x] **驗光詳情頁**（`/optometry/:id`，可編輯，**新增**）
- [x] 建立配鏡頁（`/optometry/:id/create-glasses-order`，鍍膜 chips、金額自動加總）
- [x] 配鏡詳情頁（`/glasses-orders/:id`，複製備註 Toast、payload 預覽可展開）
- [x] 真建單流程（付款/物流選擇、預覽、確認建立、403 友善提示）
- [x] 列印驗光單與配鏡單（`/print/optometry/:id`、`/print/glasses-order/:id`）
- [x] 介面視覺升級（中性色系、SVG 線性 icon、表格與版面精修）

## 已知限制（第二階段）

- [x] 姓名搜尋僅限本系統已同步之顧客快照（BVSHOP API 不支援姓名查詢參數）
- [x] 真建單需 `ENABLE_REAL_ORDER=true`，建議先於 dev 環境驗證 payment/logistic/cvs
