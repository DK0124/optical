import { Hono } from "hono";
import { optometryRecordInputSchema } from "@optical/shared";
import type { Env, AppVariables } from "../types";
import { nowIso, randomId } from "../server/id";
import { logAudit } from "../server/audit";

export const optometryRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

optometryRoutes.post("/optometry-records", async (c) => {
  const body = await c.req.json();
  const parsed = optometryRecordInputSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ message: "驗光資料格式錯誤", errors: parsed.error.flatten() }, 422);
  }

  const input = parsed.data;
  const companyId = c.get("companyId");
  const id = randomId("OP");
  const now = nowIso();

  await c.env.DB.prepare(
    `INSERT INTO optometry_records (
      id, company_id, bvshop_customer_id, exam_date, staff_id, staff_name,
      dominant_eye, purpose,
      right_sph, right_cyl, right_axis, right_add, right_va, right_pd, right_prism,
      left_sph, left_cyl, left_axis, left_add, left_va, left_pd, left_prism,
      note, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
  )
    .bind(
      id,
      companyId,
      input.bvshopCustomerId,
      input.examDate,
      null,
      input.staffName || null,
      input.dominantEye,
      input.purpose,
      input.right.sph ?? null,
      input.right.cyl ?? null,
      input.right.axis ?? null,
      input.right.add ?? null,
      input.right.va ?? null,
      input.right.pd ?? null,
      input.right.prism ?? null,
      input.left.sph ?? null,
      input.left.cyl ?? null,
      input.left.axis ?? null,
      input.left.add ?? null,
      input.left.va ?? null,
      input.left.pd ?? null,
      input.left.prism ?? null,
      input.note || null,
      now,
      now
    )
    .run();

  const record = await c.env.DB.prepare(
    `SELECT * FROM optometry_records WHERE company_id = ? AND id = ?`
  )
    .bind(companyId, id)
    .first();

  await logAudit(c, {
    action: "optometry.create",
    targetType: "optometry_record",
    targetId: id,
    after: record
  });

  return c.json({ data: record }, 201);
});

optometryRoutes.get("/customers/:bvshopCustomerId/optometry-records", async (c) => {
  const companyId = c.get("companyId");
  const bvshopCustomerId = c.req.param("bvshopCustomerId");

  const res = await c.env.DB.prepare(
    `SELECT * FROM optometry_records
     WHERE company_id = ? AND bvshop_customer_id = ? AND status = 'active'
     ORDER BY exam_date DESC, created_at DESC`
  )
    .bind(companyId, bvshopCustomerId)
    .all();

  return c.json({ data: res.results });
});

optometryRoutes.get("/optometry-records/:id", async (c) => {
  const companyId = c.get("companyId");
  const id = c.req.param("id");

  const record = await c.env.DB.prepare(
    `SELECT * FROM optometry_records WHERE company_id = ? AND id = ?`
  )
    .bind(companyId, id)
    .first();

  if (!record) return c.json({ message: "找不到驗光紀錄" }, 404);

  return c.json({ data: record });
});

optometryRoutes.patch("/optometry-records/:id", async (c) => {
  // MVP：先保守處理，只允許更新 note/status。後續請 Copilot 擴充完整欄位更新。
  const companyId = c.get("companyId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const before = await c.env.DB.prepare(
    `SELECT * FROM optometry_records WHERE company_id = ? AND id = ?`
  )
    .bind(companyId, id)
    .first();

  if (!before) return c.json({ message: "找不到驗光紀錄" }, 404);

  await c.env.DB.prepare(
    `UPDATE optometry_records SET note = ?, status = ?, updated_at = ? WHERE company_id = ? AND id = ?`
  )
    .bind(body.note ?? (before as any).note, body.status ?? (before as any).status, nowIso(), companyId, id)
    .run();

  const after = await c.env.DB.prepare(
    `SELECT * FROM optometry_records WHERE company_id = ? AND id = ?`
  )
    .bind(companyId, id)
    .first();

  await logAudit(c, {
    action: "optometry.update",
    targetType: "optometry_record",
    targetId: id,
    before,
    after
  });

  return c.json({ data: after });
});
