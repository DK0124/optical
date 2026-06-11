# CHANGELOG

## [第一階段完整實作] - 2026-06-11

### 步驟 1：後端中介層強化

**修改檔案：**
- `apps/api/src/types.ts`：新增 `REQUIRE_AUTH?: string`、`ENABLE_REAL_ORDER?: string` 環境變數型別
- `apps/api/src/server/auth.ts`：新增 `REQUIRE_AUTH` 檢查；當 `REQUIRE_AUTH=true` 且未取得使用者 email 時回 401（`/api/health` 例外）
- `apps/api/wrangler.toml.example`：新增 `REQUIRE_AUTH = "false"`、`ENABLE_REAL_ORDER = "false"` 與說明
- `apps/api/.dev.vars.example`：同上

**原因：** 確保生產環境可啟用認證守門，本機開發保持 false 方便測試。

---

### 步驟 2：顧客功能補強

**修改檔案：**
- `apps/api/src/routes/customers.ts`：
  - `GET /customers/search` 加 try/catch，BVSHOP 回 404 或未設定時回空陣列 + 友善訊息，不再 500
  - `POST /customers` 新增 `bvshopCustomerInputSchema` zod 驗證，失敗回 422
  - audit log 不再記錄完整顧客電話/email，僅記錄 id + fullName
- `packages/shared/src/schemas.ts`：新增 `bvshopCustomerInputSchema`（phone/fullName/email/address 必填）

**原因：** 安全性（不 log 個資）+ 友善的 API 錯誤體驗。

---

### 步驟 3：驗光 PATCH 擴充

**修改檔案：**
- `apps/api/src/routes/optometryRecords.ts`：
  - `PATCH /optometry-records/:id` 改為支援完整欄位更新（examDate/staffName/dominantEye/purpose/right 全欄位/left 全欄位/note/status）
  - 新增 `optometryRecordPatchSchema` zod 部分驗證
  - before/after 均寫入 audit_logs
- `packages/shared/src/schemas.ts`：新增 `optometryRecordPatchSchema`

**原因：** 前端驗光詳情頁需要編輯完整驗光欄位。

---

### 步驟 4：Order Note Generator 移至 shared

**新增檔案：**
- `packages/shared/src/orderNote.ts`：純函式 `buildBvshopOrderRemark(order)`、`buildBvshopOrderJson(order)`，完全符合 `docs/ORDER_NOTE_FORMAT.md` 格式（人可讀摘要 + `[BVGLASSES_ORDER:v1]` JSON 區塊）
- `packages/shared/src/index.ts`：加入 `export * from "./orderNote"`

**修改檔案：**
- `apps/api/src/server/orderNote.ts`：改為 re-export from `@optical/shared`，保持現有 import 不壞

**原因：** 前端配鏡詳情頁可直接使用相同函式，避免格式漂移。

---

### 步驟 5：建單 Payload 預覽

**修改檔案：**
- `apps/api/src/routes/glassesOrders.ts`：
  - `GET .../bvshop-payload-preview` 回傳更清晰的 warning 訊息
  - `POST .../create-bvshop-order` 新增 `ENABLE_REAL_ORDER` 開關；預設 false 時回 403，防止誤觸真建單

**原因：** 第一階段需要防護機制，確保建單前人工確認 payment/logistic/cvs。

---

### 步驟 6：前端整體重做

**新增檔案：**
- `apps/web/src/components/AppShell.tsx`：Sidebar + Topbar app shell，支援 RWD（窄螢幕可收合）
- `apps/web/src/components/Badge.tsx`：Badge、ProductionStatusBadge、PickupStatusBadge、ApiStatusBadge
- `apps/web/src/components/Toast.tsx`：ToastProvider、useToast hook，支援 success/error/warning/info
- `apps/web/src/components/Loading.tsx`：LoadingSpinner、LoadingSkeleton
- `apps/web/src/components/EmptyState.tsx`：空狀態元件
- `apps/web/src/pages/OptometryDetailPage.tsx`：**全新頁面**，查看驗光紀錄、可編輯全欄位、有「由此配鏡」按鈕

**修改檔案：**
- `apps/web/src/styles/global.css`：全新設計系統（CSS custom properties，靛藍 + Slate 色調，圓角/陰影/間距 token）
- `apps/web/src/App.tsx`：加入 ToastProvider、AppShell，新增 `/optometry/:id` 路由
- `apps/web/src/api/client.ts`：新增 `apiPatch`，統一錯誤處理，不在 console 印個資
- `apps/web/src/pages/DashboardPage.tsx`：快速操作卡片 + API 狀態徽章 + 流程說明
- `apps/web/src/pages/CustomerSearchPage.tsx`：搜尋列 + 結果表格，電話/email 遮罩，空狀態/錯誤處理
- `apps/web/src/pages/CustomerDetailPage.tsx`：顧客資料卡 + Tab（驗光/配鏡），批量操作按鈕
- `apps/web/src/pages/NewOptometryPage.tsx`：兩欄並排眼卡、用途主視眼選單、loading state、toast 反饋
- `apps/web/src/pages/CreateGlassesOrderPage.tsx`：鏡片鍍膜 chips、金額自動加總、度數唯讀顯示
- `apps/web/src/pages/GlassesOrderDetailPage.tsx`：配鏡摘要卡、金額卡、狀態 pill、複製備註 toast、payload 可展開預覽

---

### 步驟 7：第二階段真建單保護

**修改檔案：**
- `apps/api/src/routes/glassesOrders.ts`：`ENABLE_REAL_ORDER` 開關（同步驟 5）
- `apps/web/src/pages/GlassesOrderDetailPage.tsx`：「建立真訂單」按鈕預設 disabled，tooltip 標明第二階段功能

---

### 文件更新

**新增檔案：**
- `CHANGELOG.md`：本檔案
- `docs/SETUP_GUIDE.md`：安裝、設定、啟動、測試完整指引（含 curl 範例）

**修改檔案：**
- `docs/MVP_TASKS.md`：已完成項目全部打勾，未完成（真建單）標明原因
- `pnpm-workspace.yaml`：設定 `allowBuilds` 允許必要 native 套件

---

### 品質確認

- `pnpm -r typecheck`：✅ 全部通過（shared、api、web）
- 未引入任何 `any` 型別（舊有 route handler 保留最小必要 `any`）
- 未在 console log 完整顧客電話、email、驗光資料
- 未在 localStorage/sessionStorage 存 token 或敏感資料
- 所有寫入操作均有 audit_logs 記錄

---

## [清理與修正] - 2026-06-11

### 停止追蹤 node_modules

**新增檔案：**
- `.gitignore`：涵蓋 `node_modules/`、`.pnpm-store/`、建置產物（`dist/`、`.wrangler/`、`*.tsbuildinfo`）、機密本機設定（`.dev.vars`、`wrangler.toml`）、系統與編輯器暫存檔（`.DS_Store`、`*.log`）。`*.example` 範本與 `pnpm-lock.yaml` 維持入庫。

**解除追蹤：**
- 使用 `git rm -r --cached` 將以下目錄從 git index 移除（保留本機檔案）：
  - `node_modules/`
  - `apps/api/node_modules/`
  - `apps/web/node_modules/`
  - `packages/shared/node_modules/`
- PR diff 不再包含任何 `node_modules/` 路徑下的檔案。

### 移除沙箱安裝繞道設定

**刪除檔案：**
- `.pnpmfile.cjs`：內容僅為 `readPackage` 原樣回傳的空 hook，無實際作用，刪除。

**修改檔案：**
- `.npmrc`：移除 `ignore-scripts=true`（此設定會導致 `wrangler`、`vite`、`esbuild`、`workerd` 等需要 postinstall 的套件在乾淨環境裝不起來）。保留 `auto-install-peers=true`。

### 修正 GlassesOrderDetailPage CSS bug

**修改檔案：**
- `apps/web/src/pages/GlassesOrderDetailPage.tsx`：將 collapsible-header inline style 的 `margin: "-var(--space-6)"` 改為 `margin: "calc(-1 * var(--space-6))"`。React inline style 不支援 `-var(...)` 負號直接接 `var()` 的寫法，原本會被瀏覽器忽略。
