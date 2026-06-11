interface BadgeProps {
  variant?: "gray" | "primary" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export function Badge({ variant = "gray", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

const PRODUCTION_STATUS: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  pending: { label: "待製作", variant: "warning" },
  in_production: { label: "製作中", variant: "info" },
  quality_check: { label: "品質確認", variant: "primary" },
  ready: { label: "已完成", variant: "success" },
  cancelled: { label: "已取消", variant: "danger" },
};

const PICKUP_STATUS: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  not_picked_up: { label: "未取件", variant: "gray" },
  picked_up: { label: "已取件", variant: "success" },
  delivered: { label: "已配送", variant: "primary" },
};

export function ProductionStatusBadge({ status }: { status: string }) {
  const s = PRODUCTION_STATUS[status] ?? { label: status, variant: "gray" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function PickupStatusBadge({ status }: { status: string }) {
  const s = PICKUP_STATUS[status] ?? { label: status, variant: "gray" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function ApiStatusBadge({ ok }: { ok: boolean }) {
  return <Badge variant={ok ? "success" : "danger"}>{ok ? "● 正常" : "● 異常"}</Badge>;
}
