import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env, AppVariables } from "./types";
import { authMiddleware } from "./server/auth";
import { healthRoutes } from "./routes/health";
import { customerRoutes } from "./routes/customers";
import { optometryRoutes } from "./routes/optometryRecords";
import { glassesOrderRoutes } from "./routes/glassesOrders";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-dev-user-email"]
}));

app.use("/api/*", authMiddleware);

app.route("/api", healthRoutes);
app.route("/api", customerRoutes);
app.route("/api", optometryRoutes);
app.route("/api", glassesOrderRoutes);

app.notFound((c) => c.json({ message: "Not found" }, 404));

app.onError((err, c) => {
  const e = err as Error & { status?: number; data?: unknown };
  return c.json(
    {
      message: e.message || "Server error",
      data: e.data
    },
    (e.status as any) || 500
  );
});

export default app;
