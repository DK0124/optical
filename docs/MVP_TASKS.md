# MVP Tasks

## Phase 1：專案骨架

- [ ] pnpm workspace
- [ ] apps/web React + Vite + TypeScript
- [ ] apps/api Cloudflare Worker + Hono + TypeScript
- [ ] packages/shared
- [ ] migrations/0001_init.sql
- [ ] docs

## Phase 2：後端基礎

- [ ] Hono API server
- [ ] `/api/health`
- [ ] D1 binding 型別
- [ ] auth helper
- [ ] audit helper
- [ ] bvshopClient

## Phase 3：顧客功能

- [ ] `GET /api/customers/search`
- [ ] `GET /api/customers/:bvshopCustomerId`
- [ ] customers_snapshot upsert
- [ ] `POST /api/customers`

## Phase 4：驗光功能

- [ ] `POST /api/optometry-records`
- [ ] `GET /api/customers/:bvshopCustomerId/optometry-records`
- [ ] `PATCH /api/optometry-records/:id`
- [ ] audit log
- [ ] basic validation

## Phase 5：配鏡功能

- [ ] `POST /api/glasses-orders`
- [ ] `GET /api/glasses-orders/:id`
- [ ] `GET /api/glasses-orders/:id/order-note`
- [ ] order note generator
- [ ] save `bvshop_remark`

## Phase 6：BVSHOP 訂單

- [ ] 建單 payload preview
- [ ] 確認 paymentId/logisticId/cvs
- [ ] `POST /api/glasses-orders/:id/create-bvshop-order`
- [ ] 回寫 `bvshop_order_id` / `bvshop_order_uid`

## Phase 7：前端

- [ ] Layout
- [ ] 顧客查詢頁
- [ ] 顧客詳情頁
- [ ] 新增驗光頁
- [ ] 驗光詳情頁
- [ ] 建立配鏡頁
- [ ] 配鏡詳情頁
- [ ] 複製 BVSHOP 訂單備註
