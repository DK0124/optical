function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return Number(value).toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
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

export function buildBvshopOrderRemark(order: any): string {
  const right = {
    sph: order.right_sph,
    cyl: order.right_cyl,
    axis: order.right_axis,
    add: order.right_add,
    pd: order.right_pd,
    oh: order.right_oh,
    va: order.right_va,
    prism: order.right_prism
  };

  const left = {
    sph: order.left_sph,
    cyl: order.left_cyl,
    axis: order.left_axis,
    add: order.left_add,
    pd: order.left_pd,
    oh: order.left_oh,
    va: order.left_va,
    prism: order.left_prism
  };

  const coating = order.lens_coating
    ? String(order.lens_coating)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const json = {
    version: 1,
    system: "optical",
    linkedOptometryId: order.optometry_record_id,
    localGlassesOrderId: order.id,
    bvshopCustomerId: order.bvshop_customer_id,
    prescription: { right, left },
    frame: {
      brand: order.frame_brand,
      model: order.frame_model,
      color: order.frame_color,
      size: order.frame_size,
      price: order.frame_price ?? 0
    },
    lens: {
      brand: order.lens_brand,
      series: order.lens_series,
      type: order.lens_type,
      index: order.lens_index,
      design: order.lens_design,
      coating,
      price: order.lens_price ?? 0
    },
    amount: {
      frame: order.frame_price ?? 0,
      lens: order.lens_price ?? 0,
      discount: order.discount ?? 0,
      total: order.total ?? 0,
      deposit: order.deposit ?? 0,
      balance: order.balance ?? 0
    },
    status: {
      production: order.production_status ?? "pending",
      pickup: order.pickup_status ?? "not_picked_up"
    }
  };

  const frameText = [order.frame_brand, order.frame_model].filter(Boolean).join(" ") || "未填";
  const lensText =
    [order.lens_index, order.lens_design, order.lens_type].filter(Boolean).join(" ") ||
    "未填";

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
    "[/BVGLASSES_ORDER]"
  ].join("\n");
}
