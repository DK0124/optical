import type { Context, Next } from "hono";
import type { Env, AppVariables } from "../types";

type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

export async function authMiddleware(c: AppContext, next: Next) {
  const companyId = c.env.DEFAULT_COMPANY_ID || "COMPANY_DEFAULT";

  // Cloudflare Access 會帶這個 header。
  // 本機開發時可用 x-dev-user-email 模擬。
  const accessEmail =
    c.req.header("Cf-Access-Authenticated-User-Email") ||
    c.req.header("x-dev-user-email") ||
    null;

  c.set("companyId", companyId);
  c.set("userEmail", accessEmail);
  c.set("userId", accessEmail);

  await next();
}
