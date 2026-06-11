import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { LoadingSpinner } from "../components/Loading";
import { useToast } from "../components/Toast";

interface OptometryRecord {
  id: string;
  bvshop_customer_id: string;
  exam_date: string;
  right_sph: number | null;
  right_cyl: number | null;
  right_axis: number | null;
  right_add: number | null;
  right_pd: number | null;
  right_va: string | null;
  right_prism: string | null;
  left_sph: number | null;
  left_cyl: number | null;
  left_axis: number | null;
  left_add: number | null;
  left_pd: number | null;
  left_va: string | null;
  left_prism: string | null;
}

const COATING_OPTIONS = [
  { value: "blue_cut", label: "抗藍光" },
  { value: "anti_reflection", label: "抗反射" },
  { value: "uv", label: "UV 防護" },
  { value: "anti_scratch", label: "防刮" },
  { value: "photochromic", label: "變色片" },
];

const LENS_TYPES = [
  { value: "single_vision", label: "單焦" },
  { value: "bifocal", label: "雙焦" },
  { value: "progressive", label: "漸進多焦" },
  { value: "reading", label: "閱讀" },
];

const LENS_INDEXES = ["1.50", "1.56", "1.60", "1.67", "1.71", "1.74", "1.76"];

export default function CreateGlassesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [record, setRecord] = useState<OptometryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Frame
  const [frameBrand, setFrameBrand] = useState("");
  const [frameModel, setFrameModel] = useState("");
  const [frameColor, setFrameColor] = useState("");
  const [frameSize, setFrameSize] = useState("");
  const [framePrice, setFramePrice] = useState("");

  // Lens
  const [lensBrand, setLensBrand] = useState("");
  const [lensSeries, setLensSeries] = useState("");
  const [lensType, setLensType] = useState("single_vision");
  const [lensIndex, setLensIndex] = useState("1.67");
  const [lensDesign, setLensDesign] = useState("");
  const [lensCoating, setLensCoating] = useState<string[]>([]);
  const [lensPrice, setLensPrice] = useState("");

  // Amount
  const [discount, setDiscount] = useState("0");
  const [deposit, setDeposit] = useState("0");
  const [note, setNote] = useState("");

  useEffect(() => {
    apiGet<{ data: OptometryRecord }>(`/api/optometry-records/${id}`)
      .then((res) => setRecord(res.data))
      .catch(() => toast.error("載入驗光紀錄失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!record) return <div className="alert alert-error">找不到驗光紀錄</div>;

  const fp = Number(framePrice) || 0;
  const lp = Number(lensPrice) || 0;
  const disc = Number(discount) || 0;
  const dep = Number(deposit) || 0;
  const total = fp + lp - disc;
  const balance = total - dep;

  function toggleCoating(val: string) {
    setLensCoating((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await apiPost<{ data: { id: string } }>("/api/glasses-orders", {
        optometryRecordId: record!.id,
        bvshopCustomerId: record!.bvshop_customer_id,
        orderDate: new Date().toISOString().slice(0, 10),
        prescription: {
          right: {
            sph: record!.right_sph, cyl: record!.right_cyl, axis: record!.right_axis,
            add: record!.right_add, pd: record!.right_pd, oh: null,
            va: record!.right_va, prism: record!.right_prism,
          },
          left: {
            sph: record!.left_sph, cyl: record!.left_cyl, axis: record!.left_axis,
            add: record!.left_add, pd: record!.left_pd, oh: null,
            va: record!.left_va, prism: record!.left_prism,
          },
        },
        frame: {
          brand: frameBrand || null, model: frameModel || null,
          color: frameColor || null, size: frameSize || null,
          price: fp,
        },
        lens: {
          brand: lensBrand || null, series: lensSeries || null,
          type: lensType, index: lensIndex,
          design: lensDesign || null, coating: lensCoating, price: lp,
        },
        amount: { discount: disc, total, deposit: dep, balance },
        note: note || null,
      });
      toast.success("配鏡紀錄已建立！");
      navigate(`/glasses-orders/${res.data.id}`);
    } catch (e) {
      toast.error("建立失敗", e instanceof Error ? e.message : "請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-breadcrumb">
          <Link to={`/customers/${record.bvshop_customer_id}`}>顧客 {record.bvshop_customer_id}</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <Link to={`/optometry/${id}`}>驗光 {id}</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <span>建立配鏡</span>
        </div>
        <h1>建立配鏡紀錄</h1>
        <p className="page-header-desc">依驗光資料 {id} 建立</p>
      </div>

      {/* Prescription readonly */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">🔬 驗光度數（來源）</div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-slate-400)" }}>唯讀，驗光日期：{record.exam_date}</span>
        </div>
        <div className="eyes-grid">
          {(["right", "left"] as const).map((side) => (
            <div key={side} className={`eye-card eye-card-${side === "right" ? "od" : "os"}`}>
              <div className="eye-card-title">{side === "right" ? "👁️ 右眼 OD" : "👁️ 左眼 OS"}</div>
              <div className="detail-grid">
                {[
                  ["SPH", record[`${side}_sph`]],
                  ["CYL", record[`${side}_cyl`]],
                  ["AXIS", record[`${side}_axis`]],
                  ["ADD", record[`${side}_add`]],
                  ["PD", record[`${side}_pd`]],
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

      {/* Frame */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">🖼️ 鏡框資料</div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label className="field-label">鏡框品牌</label>
            <input className="field-input" value={frameBrand} onChange={(e) => setFrameBrand(e.target.value)} placeholder="例：愛視爾" />
          </div>
          <div className="field">
            <label className="field-label">鏡框型號</label>
            <input className="field-input" value={frameModel} onChange={(e) => setFrameModel(e.target.value)} placeholder="例：SUI161" />
          </div>
          <div className="field">
            <label className="field-label">顏色 <span className="field-label-optional">選填</span></label>
            <input className="field-input" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} placeholder="例：黑色" />
          </div>
          <div className="field">
            <label className="field-label">尺寸 <span className="field-label-optional">選填</span></label>
            <input className="field-input" value={frameSize} onChange={(e) => setFrameSize(e.target.value)} placeholder="例：52-17-140" />
          </div>
          <div className="field">
            <label className="field-label">鏡框定價（NT$）</label>
            <input className="field-input" type="number" min="0" value={framePrice} onChange={(e) => setFramePrice(e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>

      {/* Lens */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">🔭 鏡片資料</div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label className="field-label">鏡片類型</label>
            <select className="field-select" value={lensType} onChange={(e) => setLensType(e.target.value)}>
              {LENS_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">折射率</label>
            <select className="field-select" value={lensIndex} onChange={(e) => setLensIndex(e.target.value)}>
              {LENS_INDEXES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">設計 <span className="field-label-optional">選填</span></label>
            <input className="field-input" value={lensDesign} onChange={(e) => setLensDesign(e.target.value)} placeholder="例：aspheric" />
          </div>
          <div className="field">
            <label className="field-label">品牌 <span className="field-label-optional">選填</span></label>
            <input className="field-input" value={lensBrand} onChange={(e) => setLensBrand(e.target.value)} placeholder="例：HOYA" />
          </div>
          <div className="field">
            <label className="field-label">系列 <span className="field-label-optional">選填</span></label>
            <input className="field-input" value={lensSeries} onChange={(e) => setLensSeries(e.target.value)} placeholder="例：Hilux" />
          </div>
          <div className="field">
            <label className="field-label">鏡片定價（NT$）</label>
            <input className="field-input" type="number" min="0" value={lensPrice} onChange={(e) => setLensPrice(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="field">
          <label className="field-label">鍍膜處理</label>
          <div className="chip-group">
            {COATING_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`chip${lensCoating.includes(c.value) ? " selected" : ""}`}
                onClick={() => toggleCoating(c.value)}
              >
                {lensCoating.includes(c.value) ? "✓ " : ""}{c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">💰 金額明細</div>
        </div>
        <div className="grid-2">
          <div>
            <div className="grid-2">
              <div className="field">
                <label className="field-label">折扣（NT$）</label>
                <input className="field-input" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">訂金（NT$）</label>
                <input className="field-input" type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card card-sm" style={{ background: "var(--color-slate-50)" }}>
            <table className="amount-table">
              <tbody>
                <tr>
                  <td>鏡框</td>
                  <td>NT$ {fp.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>鏡片</td>
                  <td>NT$ {lp.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>折扣</td>
                  <td>−NT$ {disc.toLocaleString()}</td>
                </tr>
                <tr className="amount-total">
                  <td>合計</td>
                  <td>NT$ {total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>已付訂金</td>
                  <td>NT$ {dep.toLocaleString()}</td>
                </tr>
                <tr className="amount-balance">
                  <td>尾款</td>
                  <td>NT$ {balance.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field-label">備註 <span className="field-label-optional">選填</span></label>
          <textarea className="field-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="配鏡備註" />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
        <Link className="btn btn-secondary" to={`/optometry/${id}`}>取消</Link>
        <button className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ width: 16, height: 16 }} /> 建立中…</>
            : "✅ 建立配鏡紀錄"}
        </button>
      </div>
    </div>
  );
}
