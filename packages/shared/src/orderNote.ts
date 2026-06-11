function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return Number(value)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/0$/, "");
}

function formatEye(eye: {
  sph?: number | null;
  cyl?: number | null;
  axis?: number | null;
  pd?: number | null;
}) {
  const sph = formatNumber(eye.sph);
  const cyl = formatNumber(eye.cyl);
  const axis = eye.axis ?? "";
  const pd = eye.pd ?? "";
  return `${sph} / ${cyl} x ${axis}，PD ${pd}`;
}

export interface GlassesOrderForRemark {
  id: string;
  optometry_record_id?: string | null;
  bvshop_customer_id?: string | null;
  right_sph?: number | null;
  right_cyl?: number | null;
  right_axis?: number | null;
  right_add?: number | null;
  right_pd?: number | null;
  right_oh?: number | null;
  right_va?: string | null;
  right_prism?: string | null;
  left_sph?: number | null;
  left_cyl?: number | null;
  left_axis?: number | null;
  left_add?: number | null;
  left_pd?: number | null;
  left_oh?: number | null;
  left_va?: string | null;
  left_prism?: string | null;
  frame_brand?: string | null;
  frame_model?: string | null;
  frame_color?: string | null;
  frame_size?: string | null;
  frame_price?: number | null;
  lens_brand?: string | null;
  lens_series?: string | null;
  lens_type?: string | null;
  lens_index?: string | null;
  lens_design?: string | null;
  lens_coating?: string | null;
  lens_price?: number | null;
  discount?: number | null;
  total?: number | null;
  deposit?: number | null;
  balance?: number | null;
  production_status?: string | null;
  pickup_status?: string | null;
  note?: string | null;
}

export function buildBvshopOrderJson(order: GlassesOrderForRemark): object {
  const right = {
    sph: order.right_sph ?? null,
    cyl: order.right_cyl ?? null,
    axis: order.right_axis ?? null,
    add: order.right_add ?? null,
    pd: order.right_pd ?? null,
    oh: order.right_oh ?? null,
    va: order.right_va ?? null,
    prism: order.right_prism ?? null,
  };

  const left = {
    sph: order.left_sph ?? null,
    cyl: order.left_cyl ?? null,
    axis: order.left_axis ?? null,
    add: order.left_add ?? null,
    pd: order.left_pd ?? null,
    oh: order.left_oh ?? null,
    va: order.left_va ?? null,
    prism: order.left_prism ?? null,
  };

  const coating = order.lens_coating
    ? String(order.lens_coating)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    version: 1,
    system: "optical",
    linkedOptometryId: order.optometry_record_id ?? null,
    localGlassesOrderId: order.id,
    bvshopCustomerId: order.bvshop_customer_id ?? null,
    prescription: { right, left },
    frame: {
      brand: order.frame_brand ?? null,
      model: order.frame_model ?? null,
      color: order.frame_color ?? null,
      size: order.frame_size ?? null,
      price: order.frame_price ?? 0,
    },
    lens: {
      brand: order.lens_brand ?? null,
      series: order.lens_series ?? null,
      type: order.lens_type ?? null,
      index: order.lens_index ?? null,
      design: order.lens_design ?? null,
      coating,
      price: order.lens_price ?? 0,
    },
    amount: {
      frame: order.frame_price ?? 0,
      lens: order.lens_price ?? 0,
      discount: order.discount ?? 0,
      total: order.total ?? 0,
      deposit: order.deposit ?? 0,
      balance: order.balance ?? 0,
    },
    status: {
      production: order.production_status ?? "pending",
      pickup: order.pickup_status ?? "not_picked_up",
    },
  };
}

export function buildBvshopOrderRemark(order: GlassesOrderForRemark): string {
  const right = {
    sph: order.right_sph,
    cyl: order.right_cyl,
    axis: order.right_axis,
    pd: order.right_pd,
  };

  const left = {
    sph: order.left_sph,
    cyl: order.left_cyl,
    axis: order.left_axis,
    pd: order.left_pd,
  };

  const coating = order.lens_coating
    ? String(order.lens_coating)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const json = buildBvshopOrderJson(order);

  const frameText =
    [order.frame_brand, order.frame_model].filter(Boolean).join(" ") || "未填";
  const lensText =
    [order.lens_index, order.lens_design, order.lens_type]
      .filter(Boolean)
      .join(" ") || "未填";

  return [
    "眼鏡配鏡資料：",
    `驗光紀錄：${order.optometry_record_id || "未連結"}`,
    `配鏡紀錄：${order.id}`,
    `右眼：${formatEye(right)}`,
    `左眼：${formatEye(left)}`,
    `鏡框：${frameText}`,
    `鏡片：${lensText}${coating.length ? "，" + coating.join("、") : ""}`,
    `取件狀態：${order.pickup_status || "not_picked_up"}`,
    order.note ? `備註：${order.note}` : "備註：",
    "",
    "[BVGLASSES_ORDER:v1]",
    JSON.stringify(json, null, 2),
    "[/BVGLASSES_ORDER]",
  ].join("\n");
}
