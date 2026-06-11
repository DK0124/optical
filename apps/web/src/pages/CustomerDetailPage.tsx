import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { LoadingSpinner } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { ProductionStatusBadge, PickupStatusBadge } from "../components/Badge";

interface CustomerSnapshot {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  bvshop_customer_id: string;
  updated_at: string;
}

interface OptometryRecord {
  id: string;
  exam_date: string;
  staff_name: string;
  right_sph: number;
  right_cyl: number;
  right_axis: number;
  left_sph: number;
  left_cyl: number;
  left_axis: number;
  purpose: string;
  dominant_eye: string;
}

interface GlassesOrder {
  id: string;
  order_date: string;
  frame_brand: string;
  frame_model: string;
  lens_index: string;
  lens_type: string;
  total: number;
  production_status: string;
  pickup_status: string;
  bvshop_order_uid: string;
}

interface CustomerDetailResponse {
  customer: CustomerSnapshot | null;
  optometryRecords: OptometryRecord[];
  glassesOrders: GlassesOrder[];
}

function maskPhone(phone?: string) {
  if (!phone) return "—";
  return phone.replace(/(\d{4})\d{3}(\d{3})/, "$1 *** $2");
}

function maskEmail(email?: string) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

const PURPOSE_LABEL: Record<string, string> = {
  daily: "日常", driving: "開車", reading: "閱讀", computer: "電腦", sport: "運動", other: "其他",
};

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [data, setData] = useState<CustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"optometry" | "glasses">("optometry");

  useEffect(() => {
    setLoading(true);
    apiGet<CustomerDetailResponse>(`/api/customers/${customerId}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <LoadingSpinner />;

  const c = data?.customer;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-breadcrumb">
          <Link to="/customers/search">查詢顧客</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <span>{c?.full_name || `顧客 ${customerId}`}</span>
        </div>
        <div className="page-header-top">
          <h1>{c?.full_name || `顧客 ${customerId}`}</h1>
          <div className="page-header-actions">
            <Link className="btn btn-primary" to={`/customers/${customerId}/optometry/new`}>
              新增驗光
            </Link>
          </div>
        </div>
      </div>

      {/* Customer info card */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">顧客基本資料</div>
          {c && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-slate-400)" }}>
              上次同步：{new Date(c.updated_at).toLocaleString("zh-TW")}
            </span>
          )}
        </div>
        {c ? (
          <div className="customer-info-grid">
            <div className="customer-info-item">
              <span className="customer-info-label">BVSHOP 顧客 ID</span>
              <code style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.bvshop_customer_id}</code>
            </div>
            <div className="customer-info-item">
              <span className="customer-info-label">姓名</span>
              <span className="customer-info-value">{c.full_name || "—"}</span>
            </div>
            <div className="customer-info-item">
              <span className="customer-info-label">電話</span>
              <span className="customer-info-value">{maskPhone(c.phone)}</span>
            </div>
            <div className="customer-info-item">
              <span className="customer-info-label">Email</span>
              <span className="customer-info-value">{maskEmail(c.email)}</span>
            </div>
            <div className="customer-info-item">
              <span className="customer-info-label">地址</span>
              <span className="customer-info-value">{c.address || "—"}</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning" style={{ marginBottom: 0 }}>
            尚未建立顧客快照。請先至「查詢顧客」頁面搜尋此顧客以同步快照。
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn${activeTab === "optometry" ? " active" : ""}`}
          onClick={() => setActiveTab("optometry")}
        >
          驗光紀錄 ({data?.optometryRecords?.length ?? 0})
        </button>
        <button
          className={`tab-btn${activeTab === "glasses" ? " active" : ""}`}
          onClick={() => setActiveTab("glasses")}
        >
          配鏡紀錄 ({data?.glassesOrders?.length ?? 0})
        </button>
      </div>

      {/* Optometry tab */}
      {activeTab === "optometry" && (
        <div className="card">
          {!data?.optometryRecords?.length ? (
            <EmptyState
              title="尚無驗光紀錄"
              description="點擊「新增驗光」開始建立驗光資料"
              action={
                <Link className="btn btn-primary" to={`/customers/${customerId}/optometry/new`}>
                  新增驗光
                </Link>
              }
            />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>右眼 (SPH/CYL×AXIS)</th>
                    <th>左眼 (SPH/CYL×AXIS)</th>
                    <th>用途</th>
                    <th>驗光師</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.optometryRecords.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.exam_date}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "var(--text-xs)" }}>
                        {r.right_sph ?? "—"} / {r.right_cyl ?? "—"} × {r.right_axis ?? "—"}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "var(--text-xs)" }}>
                        {r.left_sph ?? "—"} / {r.left_cyl ?? "—"} × {r.left_axis ?? "—"}
                      </td>
                      <td>{PURPOSE_LABEL[r.purpose] || r.purpose}</td>
                      <td>{r.staff_name || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link className="btn btn-sm btn-secondary" to={`/optometry/${r.id}`}>
                            查看
                          </Link>
                          <Link className="btn btn-sm btn-primary" to={`/optometry/${r.id}/create-glasses-order`}>
                            配鏡
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Glasses tab */}
      {activeTab === "glasses" && (
        <div className="card">
          {!data?.glassesOrders?.length ? (
            <EmptyState
              title="尚無配鏡紀錄"
              description="請先建立驗光紀錄，再由驗光建立配鏡"
            />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>鏡框</th>
                    <th>鏡片</th>
                    <th>金額</th>
                    <th>製作狀態</th>
                    <th>取件狀態</th>
                    <th>BV 訂單</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.glassesOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.order_date}</td>
                      <td>{[o.frame_brand, o.frame_model].filter(Boolean).join(" ") || "—"}</td>
                      <td>{[o.lens_index, o.lens_type].filter(Boolean).join(" ") || "—"}</td>
                      <td style={{ fontWeight: 600 }}>NT$ {(o.total || 0).toLocaleString()}</td>
                      <td><ProductionStatusBadge status={o.production_status} /></td>
                      <td><PickupStatusBadge status={o.pickup_status} /></td>
                      <td>
                        {o.bvshop_order_uid
                          ? <code style={{ fontSize: "11px" }}>{o.bvshop_order_uid}</code>
                          : <span style={{ color: "var(--color-slate-400)", fontSize: "var(--text-xs)" }}>未建單</span>}
                      </td>
                      <td>
                        <Link className="btn btn-sm btn-secondary" to={`/glasses-orders/${o.id}`}>
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
