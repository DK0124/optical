# BVSHOP 眼鏡行驗光配鏡管理系統 MVP

這是一個給 GitHub Copilot 接手開發的初版專案包。

## 核心設計

- BVSHOP 負責：顧客、訂單、付款、商品、發票、出貨。
- 本系統負責：驗光資料、配鏡資料、歷史紀錄、操作紀錄。
- BVSHOP 顧客 API 目前不處理顧客備註；驗光資料不放 BVSHOP 顧客備註。
- BVSHOP 訂單備註 `remark` 用來保存「配鏡摘要 + JSON 區塊 + 本系統驗光紀錄 ID」。

## 技術棧

- 前端：React + Vite + TypeScript
- 後端：Cloudflare Workers + Hono + TypeScript
- 資料庫：Cloudflare D1
- 登入：MVP 先用 Cloudflare Access 保護網域
- 套件管理：pnpm

## 專案結構

```text
apps/web      前端
apps/api      Cloudflare Worker API
packages/shared  共用型別與工具
migrations    D1 資料庫 migration
docs          規格文件
.github       Copilot instructions
```

## 開發順序

請先看：

```text
.github/copilot-instructions.md
docs/MVP_TASKS.md
docs/SETUP_GUIDE.md
```

## 本機安裝

```bash
pnpm install
```

API：

```bash
cd apps/api
pnpm dev
```

前端：

```bash
cd apps/web
pnpm dev
```

## 環境變數

請複製：

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/api/wrangler.toml.example apps/api/wrangler.toml
```

並填入 BVSHOP API 資訊。

> 注意：不要把 `.dev.vars`、API token、真實顧客資料提交到 GitHub。
