# Data Model

## 分工

| 資料 | 主系統 |
|---|---|
| 顧客姓名、電話、Email | BVSHOP |
| 顧客快照 | D1 `customers_snapshot` |
| 驗光紀錄 | D1 `optometry_records` |
| 配鏡紀錄 | D1 `glasses_orders` |
| 訂單 | BVSHOP |
| BVSHOP 訂單備註 | BVSHOP `remark` |
| 操作紀錄 | D1 `audit_logs` |

## ID 命名建議

- 驗光紀錄：`OP-YYYYMMDD-xxxx`
- 配鏡紀錄：`GO-YYYYMMDD-xxxx`
- 公司：`COMPANY_DEFAULT`

## 重要原則

1. 每張表都要有 `company_id`。
2. `bvshop_customer_id` 是連接 BVSHOP 顧客的主 key。
3. `glasses_orders.optometry_record_id` 對應驗光紀錄。
4. `glasses_orders.bvshop_order_id` 與 `bvshop_order_uid` 對應 BVSHOP 訂單。
5. 修改驗光與配鏡都要寫入 `audit_logs`。
