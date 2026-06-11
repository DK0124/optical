import { Hono } from "hono";
import type { Env, AppVariables } from "../types";

export const healthRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

healthRoutes.get("/health", (c) => {
  return c.json({
    ok: true,
    service: "optical-api",
    time: new Date().toISOString()
  });
});
