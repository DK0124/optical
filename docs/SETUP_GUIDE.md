# Setup Guide

## 1. 解壓縮並上傳 GitHub

```bash
unzip optical.zip
cd optical
git init
git add .
git commit -m "Initial optical BVSHOP MVP package"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/optical.git
git push -u origin main
```

## 2. 安裝 pnpm

```bash
npm install -g pnpm
```

## 3. 安裝 dependencies

```bash
pnpm install
```

## 4. API 本機開發

```bash
cd apps/api
cp .dev.vars.example .dev.vars
pnpm dev
```

測試：

```bash
curl http://localhost:8787/api/health
```

## 5. 前端本機開發

```bash
cd apps/web
pnpm dev
```

## 6. 建立 Cloudflare D1

```bash
cd apps/api
wrangler d1 create optical-mvp
```

把回傳的 `database_id` 放到 `wrangler.toml`。

## 7. 套用 migration

```bash
wrangler d1 migrations apply optical-mvp --local
wrangler d1 migrations apply optical-mvp --remote
```

## 8. 設定 Cloudflare Secrets

正式部署時：

```bash
wrangler secret put BVSHOP_API_TOKEN
wrangler secret put BVSHOP_API_BASE_URL
wrangler secret put DEFAULT_COMPANY_ID
wrangler secret put DEFAULT_PAYMENT_ID
wrangler secret put DEFAULT_LOGISTIC_ID
wrangler secret put DEFAULT_CVS_STORE_NAME
wrangler secret put DEFAULT_CVS_STORE_NUM
```

## 9. 給 Copilot 的第一句

```text
請依照 .github/copilot-instructions.md 與 docs/MVP_TASKS.md，先完成 Phase 1 和 Phase 2。不要先建立真 BVSHOP 訂單，只做 health check、D1 schema、auth helper、audit helper、bvshopClient。
```
