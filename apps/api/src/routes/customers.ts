import { Hono } from "hono";
import { bvshopCustomerInputSchema } from "@optical/shared";
import type { Env, AppVariables } from "../types";
import { bvshopClient } from "../server/bvshopClient";
import { nowIso } from "../server/id";
import { logAudit } from "../server/audit";
import type { BvshopCustomerListItem, BvshopListMeta } from "@optical/shared";

export const customerRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function upsertCustomerSnapshot(c: any, customer: BvshopCustomerListItem) {
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

const EMPTY_META: BvshopListMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
};

function inferSearchType(q: string, requestedType: string) {
  if (requestedType === "phone" || requestedType === "email" || requestedType === "name") return requestedType;
  if (/^\d+$/.test(q)) return "phone";
  if (q.includes("@")) return "email";
  return "name";
}

async function queryLocalName(c: any, q: string) {
  const companyId = c.get("companyId");
  const rows = await c.env.DB.prepare(
    `SELECT bvshop_customer_id AS id, full_name AS fullName, dealer_code AS dealerCode, phone, email, city, address
      FROM customers_snapshot
      WHERE company_id = ? AND full_name LIKE ?
      ORDER BY updated_at DESC
      LIMIT 100`
  )
    .bind(companyId, `%${q}%`)
    .all();

  return (rows.results || []) as BvshopCustomerListItem[];
}

customerRoutes.get("/customers/search", async (c) => {
  const q = c.req.query("q")?.trim();
  const type = inferSearchType(q || "", (c.req.query("type") || "auto").trim());
  const page = Number(c.req.query("page") || 1);
  const limit = Math.min(Number(c.req.query("limit") || 20), 100);

  if (!q) {
    return c.json({ data: [], source: "none", meta: EMPTY_META, message: "請輸入搜尋關鍵字。" });
  }

  try {
    if (type === "name") {
      const data = await queryLocalName(c, q);
      return c.json({
        data,
        source: "local",
        meta: { ...EMPTY_META, total: data.length, per_page: data.length || 20 },
        message: "BVSHOP 不支援姓名搜尋，以下為本系統已存顧客。"
      });
    }

    const params =
      type === "email"
        ? { email: q, page, limit }
        : { phone: q, page, limit };

    const listRes = await bvshopClient.listCustomers(c.env, params);
    const customers = listRes.data || [];
    for (const item of customers) {
      await upsertCustomerSnapshot(c, item);
    }

    if (customers.length > 0) {
      return c.json({
        data: customers,
        source: "bvshop",
        meta: listRes.meta || EMPTY_META,
        message: `共找到 ${customers.length} 筆顧客資料。`
      });
    }

    // 保留純數字輸入當 ID 的相容性
    if (/^\d+$/.test(q)) {
      try {
        const byIdRes = await bvshopClient.getCustomer(c.env, q);
        if (byIdRes.data) {
          await upsertCustomerSnapshot(c, byIdRes.data);
          return c.json({
            data: [byIdRes.data],
            source: "bvshop",
            meta: { ...EMPTY_META, total: 1, per_page: 1 },
            message: "電話查無結果，已改用顧客 ID 查詢。"
          });
        }
      } catch {
        // fallback 失敗時沿用空結果
      }
    }

    return c.json({
      data: [],
      source: "bvshop",
      meta: listRes.meta || EMPTY_META,
      message: "查無顧客資料。"
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status === 404) {
      return c.json({ data: [], source: "bvshop", meta: EMPTY_META, message: "查無此顧客。" });
    }
    // BVSHOP 未設定時給友善訊息
    if (e.message?.includes("not configured")) {
      return c.json({ data: [], source: "bvshop", meta: EMPTY_META, message: "BVSHOP API 尚未設定，無法查詢顧客。" });
    }
    return c.json({ data: [], source: "bvshop", meta: EMPTY_META, message: e.message || "查詢失敗，請稍後再試。" });
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
