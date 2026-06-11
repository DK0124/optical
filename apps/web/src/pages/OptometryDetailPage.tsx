import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPatch } from "../api/client";
import { LoadingSpinner } from "../components/Loading";
import { useToast } from "../components/Toast";

interface OptometryRecord {
  id: string;
  bvshop_customer_id: string;
  exam_date: string;
  staff_name: string | null;
  dominant_eye: string;
  purpose: string;
  right_sph: number | null;
  right_cyl: number | null;
  right_axis: number | null;
  right_add: number | null;
  right_va: string | null;
  right_pd: number | null;
  right_prism: string | null;
  left_sph: number | null;
  left_cyl: number | null;
  left_axis: number | null;
  left_add: number | null;
  left_va: string | null;
  left_pd: number | null;
  left_prism: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function num(v: number | null | undefined) {
  return v !== null && v !== undefined ? String(v) : "";
}

const PURPOSE_LABEL: Record<string, string> = {
  daily: "日常", driving: "開車", reading: "閱讀",
  computer: "電腦", sport: "運動", other: "其他",
};

const DOMINANT_LABEL: Record<string, string> = {
  right: "右眼", left: "左眼", unknown: "未知",
};

export default function OptometryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [record, setRecord] = useState<OptometryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState<Partial<OptometryRecord>>({});

  useEffect(() => {
    apiGet<{ data: OptometryRecord }>(`/api/optometry-records/${id}`)
      .then((res) => {
        setRecord(res.data);
        setForm(res.data);
      })
      .catch(() => toast.error("載入失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!record) return <div className="alert alert-error">找不到驗光紀錄</div>;

  function setF(key: keyof OptometryRecord, value: string | null) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setNum(key: keyof OptometryRecord, value: string) {
    setForm((prev) => ({ ...prev, [key]: value === "" ? null : Number(value) }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await apiPatch<{ data: OptometryRecord }>(`/api/optometry-records/${id}`, {
        examDate: form.exam_date,
        staffName: form.staff_name,
        dominantEye: form.dominant_eye,
        purpose: form.purpose,
        note: form.note,
        status: form.status,
        right: {
          sph: form.right_sph,
          cyl: form.right_cyl,
          axis: form.right_axis,
          add: form.right_add,
          va: form.right_va,
          pd: form.right_pd,
          prism: form.right_prism,
        },
        left: {
          sph: form.left_sph,
          cyl: form.left_cyl,
          axis: form.left_axis,
          add: form.left_add,
          va: form.left_va,
          pd: form.left_pd,
          prism: form.left_prism,
        },
      });
      setRecord(res.data);
      setEditing(false);
      toast.success("驗光紀錄已更新！");
    } catch (e) {
      toast.error("更新失敗", e instanceof Error ? e.message : "請稍後再試");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setForm(record!);
    setEditing(false);
  }

  const EyeRow = ({
    label,
    side,
  }: {
    label: string;
    side: "right" | "left";
  }) => {
    const sph = `${side}_sph` as keyof OptometryRecord;
    const cyl = `${side}_cyl` as keyof OptometryRecord;
    const axis = `${side}_axis` as keyof OptometryRecord;
    const add = `${side}_add` as keyof OptometryRecord;
    const va = `${side}_va` as keyof OptometryRecord;
    const pd = `${side}_pd` as keyof OptometryRecord;
    const prism = `${side}_prism` as keyof OptometryRecord;
    const variant = side === "right" ? "od" : "os";

    return (
      <div className={`eye-card eye-card-${variant}`}>
        <div className="eye-card-title">{label}</div>
        {editing ? (
          <div className="field-row">
            {[
              { key: sph, label: "SPH", step: "0.25" },
              { key: cyl, label: "CYL", step: "0.25" },
              { key: axis, label: "AXIS", step: "1" },
              { key: add, label: "ADD", step: "0.25" },
              { key: pd, label: "PD", step: "0.5" },
            ].map((f) => (
              <div className="field" key={f.key as string}>
                <label className="field-label" style={{ fontSize: "11px" }}>{f.label}</label>
                <input
                  className="field-input"
                  type="number"
                  step={f.step}
                  value={num(form[f.key] as number | null)}
                  onChange={(e) => setNum(f.key, e.target.value)}
                  placeholder="—"
                />
              </div>
            ))}
            <div className="field">
              <label className="field-label" style={{ fontSize: "11px" }}>VA</label>
              <input
                className="field-input"
                value={(form[va] as string) ?? ""}
                onChange={(e) => setF(va, e.target.value || null)}
              />
            </div>
            <div className="field">
              <label className="field-label" style={{ fontSize: "11px" }}>PRISM</label>
              <input
                className="field-input"
                value={(form[prism] as string) ?? ""}
                onChange={(e) => setF(prism, e.target.value || null)}
              />
            </div>
          </div>
        ) : (
          <div className="detail-grid">
            {[
              { label: "SPH", value: record[sph] },
              { label: "CYL", value: record[cyl] },
              { label: "AXIS", value: record[axis] },
              { label: "ADD", value: record[add] },
              { label: "PD", value: record[pd] },
              { label: "VA", value: record[va] },
              { label: "PRISM", value: record[prism] },
            ].map((f) => (
              <div className="detail-item" key={f.label}>
                <div className="detail-item-label">{f.label}</div>
                <div className="detail-item-value" style={{ fontFamily: "monospace" }}>
                  {f.value !== null && f.value !== undefined ? String(f.value) : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-breadcrumb">
          <Link to="/customers/search">查詢顧客</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <Link to={`/customers/${record.bvshop_customer_id}`}>顧客 {record.bvshop_customer_id}</Link>
          <span className="page-header-breadcrumb-sep">›</span>
          <span>驗光紀錄</span>
        </div>
        <div className="page-header-top">
          <div>
            <h1>驗光紀錄</h1>
            <p className="page-header-desc">
              <code style={{ fontSize: "var(--text-xs)" }}>{record.id}</code>
              {" · "}{record.exam_date}
            </p>
          </div>
          <div className="page-header-actions">
            {!editing ? (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  編輯
                </button>
                <button className="btn btn-secondary" onClick={() => window.open(`/print/optometry/${record.id}`, "_blank")}>
                  列印驗光單
                </button>
                <Link className="btn btn-primary" to={`/optometry/${id}/create-glasses-order`}>
                  由此配鏡
                </Link>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> 儲存中</> : "儲存"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">基本資訊</div>
        </div>
        {editing ? (
          <div className="grid-3">
            <div className="field">
              <label className="field-label">驗光日期</label>
              <input
                className="field-input"
                type="date"
                value={form.exam_date ?? ""}
                onChange={(e) => setF("exam_date", e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">驗光師</label>
              <input
                className="field-input"
                value={form.staff_name ?? ""}
                onChange={(e) => setF("staff_name", e.target.value || null)}
              />
            </div>
            <div className="field">
              <label className="field-label">用途</label>
              <select
                className="field-select"
                value={form.purpose ?? "daily"}
                onChange={(e) => setF("purpose", e.target.value)}
              >
                {Object.entries(PURPOSE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label">主視眼</label>
              <select
                className="field-select"
                value={form.dominant_eye ?? "unknown"}
                onChange={(e) => setF("dominant_eye", e.target.value)}
              >
                {Object.entries(DOMINANT_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-item-label">驗光日期</div>
              <div className="detail-item-value">{record.exam_date}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">驗光師</div>
              <div className="detail-item-value">{record.staff_name || "—"}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">用途</div>
              <div className="detail-item-value">{PURPOSE_LABEL[record.purpose] || record.purpose}</div>
            </div>
            <div className="detail-item">
              <div className="detail-item-label">主視眼</div>
              <div className="detail-item-value">{DOMINANT_LABEL[record.dominant_eye] || record.dominant_eye}</div>
            </div>
          </div>
        )}
      </div>

      {/* Eyes */}
      <div className="eyes-grid" style={{ marginBottom: "var(--space-5)" }}>
        <EyeRow label="右眼 OD" side="right" />
        <EyeRow label="左眼 OS" side="left" />
      </div>

      {/* Note */}
      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div className="card-title">備註</div>
        </div>
        {editing ? (
          <textarea
            className="field-textarea"
            value={form.note ?? ""}
            onChange={(e) => setF("note", e.target.value || null)}
            placeholder="驗光備註"
          />
        ) : (
          <p style={{ color: record.note ? "var(--color-slate-700)" : "var(--color-slate-400)", fontSize: "var(--text-sm)" }}>
            {record.note || "無備註"}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          返回
        </button>
        {!editing && (
          <Link className="btn btn-primary" to={`/optometry/${id}/create-glasses-order`}>
            由此驗光建立配鏡
          </Link>
        )}
      </div>
    </div>
  );
}
