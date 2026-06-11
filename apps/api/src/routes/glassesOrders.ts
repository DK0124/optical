import { Hono } from "hono";
import { glassesOrderInputSchema } from "@optical/shared";
import type { Env, AppVariables } from "../types";
import { nowIso, randomId } from "../server/id";
import { logAudit } from "../server/audit";
import { buildBvshopOrderRemark } from "../server/orderNote";
import { bvshopClient } from "../server/bvshopClient";

export const glassesOrderRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getGlassesOrder(c: any, id: string) {
  return c.env.DB.prepare(`SELECT * FROM glasses_orders WHERE company_id = ? AND id = ?`)
    .bind(c.get("companyId"), id)
    .first();
}

glassesOrderRoutes.post("/glasses-orders", async (c) => {
  const body = await c.req.json();
  const parsed = glassesOrderInputSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ message: "配鏡資料格式錯誤", errors: parsed.error.flatten() }, 422);
  }

  const input = parsed.data;
  const companyId = c.get("companyId");
  const id = randomId("GO");
  const now = nowIso();
  const coatingText = (input.lens.coating || []).join(",");

  await c.env.DB.prepare(
    `INSERT INTO glasses_orders (
      id, company_id, optometry_record_id, bvshop_customer_id, order_date,
      right_sph, right_cyl, right_axis, right_add, right_pd, right_oh, right_va, right_prism,
      left_sph, left_cyl, left_axis, left_add, left_pd, left_oh, left_va, left_prism,
      frame_brand, frame_model, frame_color, frame_size, frame_price,
      lens_brand, lens_series, lens_type, lens_index, lens_design, lens_coating, lens_price,
      discount, total, deposit, balance, production_status, pickup_status, note,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'not_picked_up', ?, ?, ?)`
  )
    .bind(
      id,
      companyId,
      input.optometryRecordId || null,
      input.bvshopCustomerId,
      input.orderDate,
      input.prescription.right.sph ?? null,
      input.prescription.right.cyl ?? null,
      input.prescription.right.axis ?? null,
      input.prescription.right.add ?? null,
      input.prescription.right.pd ?? null,
      input.prescription.right.oh ?? null,
      input.prescription.right.va ?? null,
      input.prescription.right.prism ?? null,
      input.prescription.left.sph ?? null,
      input.prescription.left.cyl ?? null,
      input.prescription.left.axis ?? null,
      input.prescription.left.add ?? null,
      input.prescription.left.pd ?? null,
      input.prescription.left.oh ?? null,
      input.prescription.left.va ?? null,
      input.prescription.left.prism ?? null,
      input.frame.brand || null,
      input.frame.model || null,
      input.frame.color || null,
      input.frame.size || null,
      input.frame.price ?? 0,
      input.lens.brand || null,
      input.lens.series || null,
      input.lens.type || null,
      input.lens.index || null,
      input.lens.design || null,
      coatingText,
      input.lens.price ?? 0,
      input.amount.discount ?? 0,
      input.amount.total ?? 0,
      input.amount.deposit ?? 0,
      input.amount.balance ?? 0,
      input.note || null,
      now,
      now
    )
    .run();

  const order = await getGlassesOrder(c, id);
  const remark = buildBvshopOrderRemark(order);

  await c.env.DB.prepare(
    `UPDATE glasses_orders SET bvshop_remark = ?, updated_at = ? WHERE company_id = ? AND id = ?`
  )
    .bind(remark, nowIso(), companyId, id)
    .run();

  const after = await getGlassesOrder(c, id);

  await logAudit(c, {
    action: "glasses_order.create",
    targetType: "glasses_order",
    targetId: id,
    after
  });

  return c.json({ data: after }, 201);
});

glassesOrderRoutes.get("/glasses-orders/:id", async (c) => {
  const order = await getGlassesOrder(c, c.req.param("id"));
  if (!order) return c.json({ message: "找不到配鏡紀錄" }, 404);
  return c.json({ data: order });
});

glassesOrderRoutes.get("/glasses-orders/:id/order-note", async (c) => {
  const order = await getGlassesOrder(c, c.req.param("id"));
  if (!order) return c.json({ message: "找不到配鏡紀錄" }, 404);
  return c.json({ remark: buildBvshopOrderRemark(order) });
});

function buildBvshopCreateOrderPayload(c: any, order: any) {
  const remark = buildBvshopOrderRemark(order);
  const framePrice = Number(order.frame_price || 0);
  const lensPrice = Number(order.lens_price || 0);

  return {
    customerId: Number(order.bvshop_customer_id),
    paymentId: Number(c.env.DEFAULT_PAYMENT_ID || 1),
    logisticId: Number(c.env.DEFAULT_LOGISTIC_ID || 1),
    remark,
    customizeItems: [
      {
        name: ["鏡框", order.frame_brand, order.frame_model].filter(Boolean).join(" "),
        quantity: 1,
        price: framePrice
      },
      {
        name: ["鏡片", order.lens_index, order.lens_design, order.lens_type].filter(Boolean).join(" "),
        quantity: 1,
        price: lensPrice
      }
    ].filter((item) => item.name.trim() && item.price >= 0),
    customizeSales: order.discount ? [{ name: "配鏡折扣", price: Number(order.discount) }] : [],
    cvs: {
      storeName: c.env.DEFAULT_CVS_STORE_NAME || "門市自取",
      storeNum: c.env.DEFAULT_CVS_STORE_NUM || "0000"
    }
  };
}

glassesOrderRoutes.get("/glasses-orders/:id/bvshop-payload-preview", async (c) => {
  const order: any = await getGlassesOrder(c, c.req.param("id"));
  if (!order) return c.json({ message: "找不到配鏡紀錄" }, 404);

  return c.json({
    payload: buildBvshopCreateOrderPayload(c, order),
    warning: "請先確認 paymentId/logisticId/cvs 設定，再建立真訂單。第一階段僅供預覽，需人工確認 payment/logistic/cvs。"
  });
});

glassesOrderRoutes.post("/glasses-orders/:id/create-bvshop-order", async (c) => {
  // 第二階段功能：需設定 ENABLE_REAL_ORDER=true 才能啟用。
  const enableRealOrder = c.env.ENABLE_REAL_ORDER === "true";
  if (!enableRealOrder) {
    return c.json(
      { message: "真建單尚未啟用，請先確認 payment/logistic/cvs 設定並將 ENABLE_REAL_ORDER 設為 true" },
      403
    );
  }

  const order: any = await getGlassesOrder(c, c.req.param("id"));
  if (!order) return c.json({ message: "找不到配鏡紀錄" }, 404);

  const payload = buildBvshopCreateOrderPayload(c, order);
  const bvRes = await bvshopClient.createOrder(c.env, payload);

  await c.env.DB.prepare(
    `UPDATE glasses_orders SET bvshop_order_id = ?, bvshop_order_uid = ?, updated_at = ?
     WHERE company_id = ? AND id = ?`
  )
    .bind(String(bvRes.data.id), bvRes.data.uid || null, nowIso(), c.get("companyId"), order.id)
    .run();

  await logAudit(c, {
    action: "bvshop.order.create",
    targetType: "glasses_order",
    targetId: order.id,
    before: { id: order.id, bvshop_order_id: order.bvshop_order_id },
    after: { bvshop_order_id: bvRes.data.id, bvshop_order_uid: bvRes.data.uid }
  });

  return c.json({ data: bvRes.data });
});
