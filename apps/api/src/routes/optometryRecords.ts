import { Hono } from "hono";
import { optometryRecordInputSchema, optometryRecordPatchSchema } from "@optical/shared";
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
  const companyId = c.get("companyId");
  const id = c.req.param("id");
  const body = await c.req.json();

  const parsed = optometryRecordPatchSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "驗光資料格式錯誤", errors: parsed.error.flatten() }, 422);
  }

  const before = await c.env.DB.prepare(
    `SELECT * FROM optometry_records WHERE company_id = ? AND id = ?`
  )
    .bind(companyId, id)
    .first() as Record<string, unknown> | null;

  if (!before) return c.json({ message: "找不到驗光紀錄" }, 404);

  const p = parsed.data;
  const now = nowIso();

  await c.env.DB.prepare(
    `UPDATE optometry_records SET
      exam_date = ?, staff_name = ?,
      dominant_eye = ?, purpose = ?,
      right_sph = ?, right_cyl = ?, right_axis = ?, right_add = ?, right_va = ?, right_pd = ?, right_prism = ?,
      left_sph = ?, left_cyl = ?, left_axis = ?, left_add = ?, left_va = ?, left_pd = ?, left_prism = ?,
      note = ?, status = ?,
      updated_at = ?
    WHERE company_id = ? AND id = ?`
  )
    .bind(
      p.examDate ?? before.exam_date,
      p.staffName !== undefined ? p.staffName : before.staff_name,
      p.dominantEye ?? before.dominant_eye,
      p.purpose ?? before.purpose,
      p.right?.sph !== undefined ? p.right.sph : before.right_sph,
      p.right?.cyl !== undefined ? p.right.cyl : before.right_cyl,
      p.right?.axis !== undefined ? p.right.axis : before.right_axis,
      p.right?.add !== undefined ? p.right.add : before.right_add,
      p.right?.va !== undefined ? p.right.va : before.right_va,
      p.right?.pd !== undefined ? p.right.pd : before.right_pd,
      p.right?.prism !== undefined ? p.right.prism : before.right_prism,
      p.left?.sph !== undefined ? p.left.sph : before.left_sph,
      p.left?.cyl !== undefined ? p.left.cyl : before.left_cyl,
      p.left?.axis !== undefined ? p.left.axis : before.left_axis,
      p.left?.add !== undefined ? p.left.add : before.left_add,
      p.left?.va !== undefined ? p.left.va : before.left_va,
      p.left?.pd !== undefined ? p.left.pd : before.left_pd,
      p.left?.prism !== undefined ? p.left.prism : before.left_prism,
      p.note !== undefined ? p.note : before.note,
      p.status ?? before.status,
      now,
      companyId,
      id
    )
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
