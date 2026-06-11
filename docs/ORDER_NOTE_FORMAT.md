# BVSHOP 訂單備註格式

BVSHOP 訂單備註 `remark` 要同時包含：

1. 人看得懂的摘要。
2. 系統可解析的 JSON 區塊。

## 範例

```text
眼鏡配鏡資料：
驗光紀錄：OP-20260611-0001
配鏡紀錄：GO-20260611-0001
右眼：-5.25 / -0.50 x 22，PD 27.5
左眼：-3.50 / -0.50 x 150，PD 26
鏡框：愛視爾 SUI161
鏡片：1.67 非球面單焦，抗藍光
取件狀態：未取件
備註：右利眼，依本次驗光配鏡

[BVGLASSES_ORDER:v1]
{
  "version": 1,
  "system": "optical",
  "linkedOptometryId": "OP-20260611-0001",
  "localGlassesOrderId": "GO-20260611-0001",
  "bvshopCustomerId": "400000161",
  "prescription": {
    "right": {
      "sph": -5.25,
      "cyl": -0.5,
      "axis": 22,
      "add": null,
      "pd": 27.5,
      "oh": null,
      "va": null,
      "prism": null
    },
    "left": {
      "sph": -3.5,
      "cyl": -0.5,
      "axis": 150,
      "add": null,
      "pd": 26,
      "oh": null,
      "va": null,
      "prism": null
    }
  },
  "frame": {
    "brand": "愛視爾",
    "model": "SUI161",
    "color": null,
    "size": null,
    "price": 3500
  },
  "lens": {
    "brand": null,
    "series": null,
    "type": "single_vision",
    "index": "1.67",
    "design": "aspheric",
    "coating": ["blue_cut", "anti_reflection"],
    "price": 0
  },
  "amount": {
    "frame": 3500,
    "lens": 0,
    "discount": 0,
    "total": 3500,
    "deposit": 0,
    "balance": 3500
  },
  "status": {
    "production": "pending",
    "pickup": "not_picked_up"
  }
}
[/BVGLASSES_ORDER]
```
