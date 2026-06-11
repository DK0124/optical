import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { LoadingSpinner } from "../components/Loading";
import { ProductionStatusBadge, PickupStatusBadge } from "../components/Badge";
import { useToast } from "../components/Toast";

interface GlassesOrder {
  id: string;
  bvshop_customer_id: string;
  optometry_record_id: string | null;
  order_date: string;
  right_sph: number | null; right_cyl: number | null; right_axis: number | null; right_pd: number | null;
  left_sph: number | null; left_cyl: number | null; left_axis: number | null; left_pd: number | null;
  frame_brand: string | null; frame_model: string | null; frame_color: string | null; frame_size: string | null; frame_price: number;
  lens_brand: string | null; lens_series: string | null; lens_type: string | null;
  lens_index: string | null; lens_design: string | null; lens_coating: string | null; lens_price: number;
  discount: number; total: number; deposit: number; balance: number;
  production_status: string; pickup_status: string;
  bvshop_order_id: string | null; bvshop_order_uid: string | null;
  bvshop_remark: string | null;
  note: string | null;
  created_at: string; updated_at: string;
}

export default function GlassesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [order, setOrder] = useState<GlassesOrder | null>(null);
  const [remark, setRemark] = useState("");
  const [payload, setPayload] = useState<unknown>(null);
  const [payloadWarning, setPayloadWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPayload, setShowPayload] = useState(false);
  const [loadingPayload, setLoadingPayload] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<{ data: GlassesOrder }>(`/api/glasses-orders/${id}`),
      apiGet<{ remark: string }>(`/api/glasses-orders/${id}/order-note`),
    ])
      .then(([orderRes, noteRes]) => {
        setOrder(orderRes.data);
        setRemark(noteRes.remark);
      })
      .catch(() => toast.error("載入失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  async function copyRemark() {
    try {
      await navigator.clipboard.writeText(remark);
      toast.success("✅ 已複製 BVSHOP 訂單備註！", "可直接貼入 BVSHOP 訂單備註欄");
    } catch {
      toast.error("複製失敗", "請手動選取文字後複製");
    }
  }

  async function loadPayload() {
    setLoadingPayload(true);
    try {
      const res = await apiGet<{ payload: unknown; warning: string }>(
        `/api/glasses-orders/${id}/bvshop-payload-preview`
      );
      setPayload(res.payload);
      setPayloadWarning(res.warning);
      setShowPayload(true);
    } catch (e) {
      toast.error("載入預覽失敗", e instanceof Error ? e.message : "");
    } finally {
      setLoadingPayload(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="alert alert-error">找不到配鏡紀錄</div>;

  const coating = order.lens_coating
    ? order.lens_coating.split(",").filter(Boolean)
    : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-breadcrumb">
          <Link to={`/customers/${order.bvshop_customer_id}`}>顧客 {order.bvshop_customer_id}</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <span>配鏡紀錄</span>
        </div>
        <div className="page-header-top">
          <div>
            <h1>配鏡紀錄</h1>
            <p className="page-header-desc">
              <code style={{ fontSize: "var(--text-xs)" }}>{order.id}</code>
              {" · 配鏡日期："}{order.order_date}
            </p>
          </div>
          <div className="page-header-actions">
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)" }}>製作：</span>
              <ProductionStatusBadge status={order.production_status} />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)", marginLeft: "8px" }}>取件：</span>
              <PickupStatusBadge status={order.pickup_status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "var(--space-5)" }}>
        {/* Left column: prescription + frame + lens */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Prescription */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🔬 驗光度數</div>
              {order.optometry_record_id && (
                <Link className="btn btn-sm btn-ghost" to={`/optometry/${order.optometry_record_id}`}>
                  查看驗光 →
                </Link>
              )}
            </div>
            <div className="eyes-grid">
              {(["right", "left"] as const).map((side) => (
                <div key={side} className={`eye-card eye-card-${side === "right" ? "od" : "os"}`}>
                  <div className="eye-card-title">{side === "right" ? "右眼 OD" : "左眼 OS"}</div>
                  <div className="detail-grid">
                    {[
                      ["SPH", order[`${side}_sph`]],
                      ["CYL", order[`${side}_cyl`]],
                      ["AXIS", order[`${side}_axis`]],
                      ["PD", order[`${side}_pd`]],
                    ].map(([label, val]) => (
                      <div className="detail-item" key={label as string}>
                        <div className="detail-item-label">{label}</div>
                        <div className="detail-item-value" style={{ fontFamily: "monospace" }}>
                          {val !== null && val !== undefined ? String(val) : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frame & Lens */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">👓 鏡框鏡片</div>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-item-label">鏡框</div>
                <div className="detail-item-value">
                  {[order.frame_brand, order.frame_model].filter(Boolean).join(" ") || "—"}
                </div>
              </div>
              {order.frame_color && (
                <div className="detail-item">
                  <div className="detail-item-label">顏色</div>
                  <div className="detail-item-value">{order.frame_color}</div>
                </div>
              )}
              {order.frame_size && (
                <div className="detail-item">
                  <div className="detail-item-label">尺寸</div>
                  <div className="detail-item-value">{order.frame_size}</div>
                </div>
              )}
              <div className="detail-item">
                <div className="detail-item-label">鏡片</div>
                <div className="detail-item-value">
                  {[order.lens_index, order.lens_design, order.lens_type].filter(Boolean).join(" ") || "—"}
                </div>
              </div>
              {order.lens_brand && (
                <div className="detail-item">
                  <div className="detail-item-label">鏡片品牌</div>
                  <div className="detail-item-value">{order.lens_brand}</div>
                </div>
              )}
            </div>
            {coating.length > 0 && (
              <>
                <div className="divider" />
                <div>
                  <div className="detail-item-label" style={{ marginBottom: "8px" }}>鍍膜</div>
                  <div className="chip-group">
                    {coating.map((c) => (
                      <span key={c} className="chip selected" style={{ cursor: "default" }}>{c}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column: amount + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Amount */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">💰 金額明細</div>
            </div>
            <table className="amount-table">
              <tbody>
                <tr>
                  <td>鏡框</td>
                  <td>NT$ {(order.frame_price || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>鏡片</td>
                  <td>NT$ {(order.lens_price || 0).toLocaleString()}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td>折扣</td>
                    <td>−NT$ {order.discount.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="amount-total">
                  <td>合計</td>
                  <td>NT$ {(order.total || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>已付訂金</td>
                  <td>NT$ {(order.deposit || 0).toLocaleString()}</td>
                </tr>
                <tr className="amount-balance">
                  <td>尾款</td>
                  <td>NT$ {(order.balance || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* BVSHOP order */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">🛍️ BVSHOP 訂單</div>
            </div>
            {order.bvshop_order_id ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-item-label">訂單 ID</div>
                  <div className="detail-item-value"><code>{order.bvshop_order_id}</code></div>
                </div>
                <div className="detail-item">
                  <div className="detail-item-label">訂單 UID</div>
                  <div className="detail-item-value"><code>{order.bvshop_order_uid || "—"}</code></div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)", marginBottom: "var(--space-3)" }}>
                  尚未建立 BVSHOP 訂單。第一階段請複製備註後手動貼入 BVSHOP。
                </p>
                <button
                  className="btn btn-secondary"
                  disabled
                  title="第二階段功能，需設定 ENABLE_REAL_ORDER=true"
                >
                  🔒 建立真訂單（第二階段功能）
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          {order.note && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">📝 備註</div>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-700)" }}>{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* BVSHOP Order Remark */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">📋 BVSHOP 訂單備註</div>
          <button className="btn btn-success" onClick={copyRemark}>
            📋 複製備註
          </button>
        </div>
        <div className="card-body">
          <div className="remark-block">{remark}</div>
        </div>
      </div>

      {/* Payload preview */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div
          className="collapsible-header"
          onClick={() => {
            if (!showPayload && !payload) loadPayload();
            else setShowPayload((v) => !v);
          }}
          style={{ margin: "calc(-1 * var(--space-6))", borderRadius: "var(--radius-md)" }}
        >
          <span className="collapsible-title">
            🔍 建單 Payload 預覽（POST /orders）
          </span>
          <span className={`collapsible-icon${showPayload ? " open" : ""}`}>▼</span>
        </div>

        {showPayload && (
          <div className="collapsible-body" style={{ marginTop: "var(--space-4)" }}>
            <div className="alert alert-warning">
              ⚠️ {payloadWarning || "第一階段僅預覽，需人工確認 payment/logistic/cvs"}
            </div>
            {loadingPayload ? (
              <LoadingSpinner text="載入中…" />
            ) : (
              <pre className="code-block">{JSON.stringify(payload, null, 2)}</pre>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Link className="btn btn-secondary" to={`/customers/${order.bvshop_customer_id}`}>
          ← 返回顧客
        </Link>
        {order.optometry_record_id && (
          <Link className="btn btn-ghost" to={`/optometry/${order.optometry_record_id}`}>
            查看驗光紀錄
          </Link>
        )}
      </div>
    </div>
  );
}
