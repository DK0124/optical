import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { LoadingSpinner } from "../components/Loading";
import { ProductionStatusBadge, PickupStatusBadge } from "../components/Badge";
import { useToast } from "../components/Toast";
import type { BvshopLogistic, BvshopPayment, BvshopOrderResult } from "@optical/shared";

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
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [payments, setPayments] = useState<BvshopPayment[]>([]);
  const [logistics, setLogistics] = useState<BvshopLogistic[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [logisticId, setLogisticId] = useState("");
  const [storeName, setStoreName] = useState("門市自取");
  const [storeNum, setStoreNum] = useState("0000");
  const [deposit, setDeposit] = useState("");
  const [bvshopConfigMessage, setBvshopConfigMessage] = useState("");
  const [createdOrderResult, setCreatedOrderResult] = useState<BvshopOrderResult | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<{ data: GlassesOrder }>(`/api/glasses-orders/${id}`),
      apiGet<{ remark: string }>(`/api/glasses-orders/${id}/order-note`),
      apiGet<{ data: BvshopPayment[]; message?: string }>(`/api/bvshop/payments`),
      apiGet<{ data: BvshopLogistic[]; message?: string }>(`/api/bvshop/logistics`)
    ])
      .then(([orderRes, noteRes, paymentsRes, logisticsRes]) => {
        setOrder(orderRes.data);
        setRemark(noteRes.remark);
        setPayments(paymentsRes.data || []);
        setLogistics(logisticsRes.data || []);
        setPaymentId(String(paymentsRes.data?.[0]?.id ?? ""));
        setLogisticId(String(logisticsRes.data?.[0]?.id ?? ""));
        setBvshopConfigMessage(paymentsRes.message || logisticsRes.message || "");
      })
      .catch(() => toast.error("載入失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  async function copyRemark() {
    try {
      await navigator.clipboard.writeText(remark);
      toast.success("已複製 BVSHOP 訂單備註", "可直接貼入 BVSHOP 訂單備註欄");
    } catch {
      toast.error("複製失敗", "請手動選取文字後複製");
    }
  }

  async function loadPayload() {
    setLoadingPayload(true);
    try {
      const res = await apiGet<{ payload: unknown; warning: string }>(
        `/api/glasses-orders/${id}/bvshop-payload-preview?paymentId=${paymentId}&logisticId=${logisticId}&storeName=${encodeURIComponent(
          storeName
        )}&storeNum=${encodeURIComponent(storeNum)}${deposit ? `&deposit=${deposit}` : ""}`
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

  async function createBvshopOrder() {
    if (!paymentId || !logisticId) {
      toast.warning("請先選擇付款與物流方式");
      return;
    }
    if (!window.confirm("請再次確認建單內容，確定要建立 BVSHOP 訂單嗎？")) return;
    setCreatingOrder(true);
    try {
      const res = await apiPost<{ data: BvshopOrderResult }>(`/api/glasses-orders/${id}/create-bvshop-order`, {
        paymentId: Number(paymentId),
        logisticId: Number(logisticId),
        cvs: { storeName, storeNum },
        deposit: deposit ? Number(deposit) : undefined,
        confirm: true
      });
      setCreatedOrderResult(res.data);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              bvshop_order_id: String(res.data.id),
              bvshop_order_uid: res.data.uid || null
            }
          : prev
      );
      toast.success("BVSHOP 訂單建立成功");
    } catch (e) {
      const status = (e as Error & { status?: number }).status;
      if (status === 403) {
        toast.warning("尚未啟用真建單", "請確認 ENABLE_REAL_ORDER=true 後再試");
      } else {
        toast.error("建立訂單失敗", e instanceof Error ? e.message : "");
      }
    } finally {
      setCreatingOrder(false);
    }
  }

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
              <div className="card-title">驗光度數</div>
              {order.optometry_record_id && (
                <Link className="btn btn-sm btn-ghost" to={`/optometry/${order.optometry_record_id}`}>
                  查看驗光
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
              <div className="card-title">鏡框鏡片</div>
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
              <div className="card-title">金額明細</div>
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
              <div className="card-title">BVSHOP 訂單</div>
            </div>
            {bvshopConfigMessage && <div className="alert alert-warning">{bvshopConfigMessage}</div>}
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
                {createdOrderResult?.checkoutUrl && (
                  <div className="detail-item">
                    <div className="detail-item-label">結帳連結</div>
                    <div className="detail-item-value">
                      <a href={createdOrderResult.checkoutUrl} target="_blank" rel="noreferrer">
                        開啟 checkoutUrl
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: "var(--space-3)", display: "grid", gap: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)", marginBottom: "var(--space-3)" }}>
                  尚未建立 BVSHOP 訂單，請先預覽建單內容後再確認建立。
                </p>
                <div className="grid-2">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">付款方式</label>
                    <select className="field-select" value={paymentId} onChange={(e) => setPaymentId(e.target.value)}>
                      <option value="">請選擇</option>
                      {payments.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">物流方式</label>
                    <select className="field-select" value={logisticId} onChange={(e) => setLogisticId(e.target.value)}>
                      <option value="">請選擇</option>
                      {logistics.map((l) => (
                        <option key={l.id} value={String(l.id)}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">超商門市名稱</label>
                    <input className="field-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">超商店號</label>
                    <input className="field-input" value={storeNum} onChange={(e) => setStoreNum(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field-label">訂金</label>
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder={String(order.deposit || 0)}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={loadPayload}
                    disabled={loadingPayload || !paymentId || !logisticId || !payments.length || !logistics.length}
                  >
                    {loadingPayload ? "預覽中…" : "預覽建單內容"}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={createBvshopOrder}
                    disabled={creatingOrder || !paymentId || !logisticId || !payments.length || !logistics.length}
                  >
                    {creatingOrder ? "建立中…" : "確認建立訂單"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          {order.note && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">備註</div>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-700)" }}>{order.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* BVSHOP Order Remark */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">BVSHOP 訂單備註</div>
          <button className="btn btn-success" onClick={copyRemark}>
            複製備註
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
            建單 Payload 預覽（POST /orders）
          </span>
          <span className={`collapsible-icon${showPayload ? " open" : ""}`}>▾</span>
        </div>

        {showPayload && (
          <div className="collapsible-body" style={{ marginTop: "var(--space-4)" }}>
            <div className="alert alert-warning">
              {payloadWarning || "請人工確認 payment/logistic/cvs 後再建立"}
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
          返回顧客
        </Link>
        <button className="btn btn-secondary" onClick={() => window.open(`/print/glasses-order/${order.id}`, "_blank")}>
          列印配鏡單
        </button>
        {order.optometry_record_id && (
          <Link className="btn btn-ghost" to={`/optometry/${order.optometry_record_id}`}>
            查看驗光紀錄
          </Link>
        )}
      </div>
    </div>
  );
}
