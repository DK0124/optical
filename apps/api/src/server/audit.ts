import type { Env, AppVariables } from "../types";
import type { Context } from "hono";
import { nowIso, randomId } from "./id";

type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

export async function logAudit(
  c: AppContext,
  input: {
    action: string;
    targetType: string;
    targetId?: string | null;
    before?: unknown;
    after?: unknown;
  }
) {
  const companyId = c.get("companyId");
  const userEmail = c.get("userEmail");
  const ip = c.req.header("cf-connecting-ip") || null;
  const userAgent = c.req.header("user-agent") || null;

  await c.env.DB.prepare(
    `INSERT INTO audit_logs (
      id, company_id, user_id, user_email, action, target_type, target_id,
      before_json, after_json, ip_address, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      randomId("AUDIT"),
      companyId,
      userEmail,
      userEmail,
      input.action,
      input.targetType,
      input.targetId || null,
      input.before ? JSON.stringify(input.before) : null,
      input.after ? JSON.stringify(input.after) : null,
      ip,
      userAgent,
      nowIso()
    )
    .run();
}
