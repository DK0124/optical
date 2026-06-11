import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../api/client";
import { useToast } from "../components/Toast";

const emptyEye = { sph: "", cyl: "", axis: "", add: "", va: "", pd: "", prism: "" };

function parseNum(value: string) {
  return value === "" ? null : Number(value);
}

type EyeState = typeof emptyEye;

const EYE_FIELDS: { key: keyof EyeState; label: string; step?: string; type?: string }[] = [
  { key: "sph", label: "球面度數 SPH", step: "0.25", type: "number" },
  { key: "cyl", label: "柱面度數 CYL", step: "0.25", type: "number" },
  { key: "axis", label: "軸度 AXIS", step: "1", type: "number" },
  { key: "add", label: "加入度 ADD", step: "0.25", type: "number" },
  { key: "pd", label: "瞳距 PD", step: "0.5", type: "number" },
  { key: "va", label: "視力 VA", type: "text" },
  { key: "prism", label: "稜鏡 PRISM", type: "text" },
];

const PURPOSE_OPTIONS = [
  { value: "daily", label: "日常配戴" },
  { value: "driving", label: "開車" },
  { value: "reading", label: "閱讀" },
  { value: "computer", label: "電腦" },
  { value: "sport", label: "運動" },
  { value: "other", label: "其他" },
];

const DOMINANT_OPTIONS = [
  { value: "right", label: "右眼" },
  { value: "left", label: "左眼" },
  { value: "unknown", label: "未知" },
];

export default function NewOptometryPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [staffName, setStaffName] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [dominantEye, setDominantEye] = useState("unknown");
  const [purpose, setPurpose] = useState("daily");
  const [right, setRight] = useState<EyeState>({ ...emptyEye });
  const [left, setLeft] = useState<EyeState>({ ...emptyEye });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await apiPost("/api/optometry-records", {
        bvshopCustomerId: customerId,
        examDate,
        staffName: staffName || null,
        dominantEye,
        purpose,
        right: {
          sph: parseNum(right.sph),
          cyl: parseNum(right.cyl),
          axis: parseNum(right.axis),
          add: parseNum(right.add),
          va: right.va || null,
          pd: parseNum(right.pd),
          prism: right.prism || null,
        },
        left: {
          sph: parseNum(left.sph),
          cyl: parseNum(left.cyl),
          axis: parseNum(left.axis),
          add: parseNum(left.add),
          va: left.va || null,
          pd: parseNum(left.pd),
          prism: left.prism || null,
        },
        note: note || null,
      });
      toast.success("驗光紀錄已儲存！");
      navigate(`/customers/${customerId}`);
    } catch (e) {
      toast.error("儲存失敗", e instanceof Error ? e.message : "請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  function EyeCard({
    label,
    variant,
    eye,
    setEye,
  }: {
    label: string;
    variant: "od" | "os";
    eye: EyeState;
    setEye: (v: EyeState) => void;
  }) {
    return (
      <div className={`eye-card eye-card-${variant}`}>
        <div className="eye-card-title">
          <span>{variant === "od" ? "右眼 OD" : "左眼 OS"}</span>
          <span style={{ color: "var(--color-slate-400)", fontWeight: 400 }}>{label}</span>
        </div>
        <div className="field-row">
          {EYE_FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label className="field-label" style={{ fontSize: "11px" }}>{f.label}</label>
              <input
                className="field-input"
                type={f.type}
                step={f.step}
                value={eye[f.key]}
                onChange={(e) => setEye({ ...eye, [f.key]: e.target.value })}
                placeholder="—"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-breadcrumb">
          <Link to="/customers/search">查詢顧客</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <Link to={`/customers/${customerId}`}>顧客 {customerId}</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <span>新增驗光</span>
        </div>
        <h1>新增驗光紀錄</h1>
        <p className="page-header-desc">顧客 ID：{customerId}</p>
      </div>

      {/* Basic info */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">基本資訊</div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label className="field-label">驗光日期</label>
            <input
              className="field-input"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">驗光師 <span className="field-label-optional">選填</span></label>
            <input
              className="field-input"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="驗光師姓名"
            />
          </div>
          <div className="field">
            <label className="field-label">用途</label>
            <select className="field-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">主視眼</label>
            <select className="field-select" value={dominantEye} onChange={(e) => setDominantEye(e.target.value)}>
              {DOMINANT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Eye cards */}
      <div className="eyes-grid" style={{ marginBottom: "var(--space-5)" }}>
        <EyeCard label="" variant="od" eye={right} setEye={setRight} />
        <EyeCard label="" variant="os" eye={left} setEye={setLeft} />
      </div>

      {/* Note */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="field">
          <label className="field-label">備註 <span className="field-label-optional">選填</span></label>
          <textarea
            className="field-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="驗光備註、特殊狀況等"
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
        <Link className="btn btn-secondary" to={`/customers/${customerId}`}>
          取消
        </Link>
        <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> 儲存中…</> : "儲存驗光紀錄"}
        </button>
      </div>
    </div>
  );
}
