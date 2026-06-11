import { Hono } from "hono";
import { bvshopCustomerInputSchema } from "@optical/shared";
import type { Env, AppVariables } from "../types";
import { bvshopClient } from "../server/bvshopClient";
import { nowIso } from "../server/id";
import { logAudit } from "../server/audit";

export const customerRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function upsertCustomerSnapshot(c: any, customer: any) {
  const companyId = c.get("companyId");
  const now = nowIso();
  const id = `${companyId}:${customer.id}`;

  await c.env.DB.prepare(
    `INSERT INTO customers_snapshot (
      id, company_id, bvshop_customer_id, bvshop_customer_no,
      full_name, phone, email, city, address, dealer_code, raw_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(company_id, bvshop_customer_id) DO UPDATE SET
      full_name = excluded.full_name,
      phone = excluded.phone,
      email = excluded.email,
      city = excluded.city,
      address = excluded.address,
      dealer_code = excluded.dealer_code,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at`
  )
    .bind(
      id,
      companyId,
      String(customer.id),
      String(customer.id),
      customer.fullName || null,
      customer.phone || null,
      customer.email || null,
      customer.city || null,
      customer.address || null,
      customer.dealerCode || null,
      JSON.stringify(customer),
      now,
      now
    )
    .run();

  return id;
}

customerRoutes.get("/customers/search", async (c) => {
  const q = c.req.query("q")?.trim();

  if (!q) {
    return c.json({ data: [], message: "請輸入 BVSHOP 顧客 ID。MVP 先支援用 ID 查詢。" });
  }

  try {
    // MVP：先假設 q 是 BVSHOP 顧客 ID。
    const res = await bvshopClient.getCustomer(c.env, q);
    if (!res.data) {
      return c.json({ data: [], message: "查無顧客" });
    }
    await upsertCustomerSnapshot(c, res.data);
    return c.json({ data: [res.data], mode: "id" });
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status === 404) {
      return c.json({ data: [], message: "查無此顧客" });
    }
    // BVSHOP 未設定時給友善訊息
    if (e.message?.includes("not configured")) {
      return c.json({ data: [], message: "BVSHOP API 尚未設定，無法查詢顧客。" });
    }
    return c.json({ data: [], message: e.message || "查詢失敗，請稍後再試。" });
  }
});

customerRoutes.get("/customers/:bvshopCustomerId", async (c) => {
  const companyId = c.get("companyId");
  const bvshopCustomerId = c.req.param("bvshopCustomerId");

  const snapshot = await c.env.DB.prepare(
    `SELECT * FROM customers_snapshot WHERE company_id = ? AND bvshop_customer_id = ?`
  )
    .bind(companyId, bvshopCustomerId)
    .first();

  const optometry = await c.env.DB.prepare(
    `SELECT * FROM optometry_records
     WHERE company_id = ? AND bvshop_customer_id = ? AND status = 'active'
     ORDER BY exam_date DESC, created_at DESC`
  )
    .bind(companyId, bvshopCustomerId)
    .all();

  const glassesOrders = await c.env.DB.prepare(
    `SELECT * FROM glasses_orders
     WHERE company_id = ? AND bvshop_customer_id = ?
     ORDER BY order_date DESC, created_at DESC`
  )
    .bind(companyId, bvshopCustomerId)
    .all();

  return c.json({
    customer: snapshot,
    optometryRecords: optometry.results,
    glassesOrders: glassesOrders.results
  });
});

customerRoutes.post("/customers", async (c) => {
  const body = await c.req.json();
  const parsed = bvshopCustomerInputSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ message: "顧客資料格式錯誤", errors: parsed.error.flatten() }, 422);
  }

  try {
    const res = await bvshopClient.createCustomer(c.env, parsed.data);
    await upsertCustomerSnapshot(c, res.data);

    await logAudit(c, {
      action: "bvshop.customer.create",
      targetType: "bvshop_customer",
      targetId: String(res.data.id),
      after: { id: res.data.id, fullName: res.data.fullName }
    });

    return c.json(res);
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.message?.includes("not configured")) {
      return c.json({ message: "BVSHOP API 尚未設定，無法建立顧客。" }, 503);
    }
    return c.json({ message: e.message || "建立顧客失敗" }, (e.status as 400 | 422 | 503) || 500);
  }
});
