import { useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/Loading";
import type { BvshopCustomerListItem, BvshopListMeta } from "@optical/shared";

interface SearchResult {
  data: BvshopCustomerListItem[];
  source?: "bvshop" | "local" | "none";
  meta?: BvshopListMeta;
  message?: string;
}

function maskPhone(phone: string) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "***";
  if (digits.length < 7) return `${digits.slice(0, 2)}***`;
  return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
}

function maskEmail(email: string) {
  if (!email) return "—";
  const parts = email.split("@");
  if (parts.length !== 2) return "—";
  const [local, domain] = parts;
  if (!local || !domain) return "—";
  return `${local.slice(0, 1)}***@${domain}`;
}

export default function CustomerSearchPage() {
  const [q, setQ] = useState("");
  const [searchType, setSearchType] = useState<"auto" | "phone" | "name" | "email">("auto");
  const [items, setItems] = useState<BvshopCustomerListItem[]>([]);
  const [meta, setMeta] = useState<BvshopListMeta | null>(null);
  const [source, setSource] = useState<SearchResult["source"]>("none");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!q.trim()) return;
    setError("");
    setMessage("");
    setLoading(true);
    setSearched(true);
    try {
      const res = await apiGet<SearchResult>(
        `/api/customers/search?q=${encodeURIComponent(q.trim())}&type=${searchType}`
      );
      setItems(res.data || []);
      setMessage(res.message || "");
      setMeta(res.meta || null);
      setSource(res.source || "none");
    } catch (e) {
      setError(e instanceof Error ? e.message : "查詢失敗");
      setItems([]);
      setMeta(null);
      setSource("none");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") search();
  }

  return (
    <div>
      <div className="page-header">
        <h1>查詢顧客</h1>
        <p className="page-header-desc">從 BVSHOP 查詢顧客資料並同步快照</p>
      </div>

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="card-header">
          <div>
            <div className="card-title">搜尋顧客</div>
            <div className="card-subtitle">支援自動辨識電話 / 姓名 / Email</div>
          </div>
        </div>
        <div className="search-bar">
          <div className="field" style={{ maxWidth: "220px", marginBottom: 0 }}>
            <label className="field-label">搜尋類型</label>
            <select
              className="field-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as typeof searchType)}
            >
              <option value="auto">自動</option>
              <option value="phone">電話</option>
              <option value="name">姓名</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">關鍵字</label>
            <input
              className="field-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入電話、姓名或 Email"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={search}
            disabled={loading || !q.trim()}
            style={{ marginTop: "22px" }}
          >
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> 查詢中</> : "查詢"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {message && !error && (
        <div className="alert alert-info">
          <span>{message}</span>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && searched && items.length === 0 && !error && (
        <div className="card">
          <EmptyState
            title="查無顧客"
            description="找不到符合的顧客資料，請換條件重試。"
          />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">查詢結果</div>
            <span className="badge badge-primary">{meta?.total ?? items.length} 筆</span>
          </div>
          {source === "local" && (
            <div className="alert alert-warning">BVSHOP 不支援姓名搜尋，以下為本系統已存顧客。</div>
          )}
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                  <th>城市 / 地址</th>
                  <th>來源</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <code style={{ fontSize: "var(--text-xs)", background: "var(--color-slate-100)", padding: "2px 6px", borderRadius: "4px" }}>
                        {c.id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.fullName || "—"}</td>
                    <td>{maskPhone(c.phone || "")}</td>
                    <td>{maskEmail(c.email || "")}</td>
                    <td>{[c.city, c.address].filter(Boolean).join(" ") || "—"}</td>
                    <td>
                      <span className={`badge ${source === "local" ? "badge-warning" : "badge-success"}`}>
                        {source === "local" ? "本機" : "BVSHOP"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/customers/${c.id}`} className="btn btn-sm btn-primary">
                        開啟
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
