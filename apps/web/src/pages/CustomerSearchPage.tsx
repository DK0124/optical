import { useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/Loading";

interface BvshopCustomer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
}

interface SearchResult {
  data: BvshopCustomer[];
  message?: string;
}

function maskPhone(phone: string) {
  if (!phone) return "—";
  return phone.replace(/(\d{4})\d{3}(\d{3})/, "$1***$2");
}

function maskEmail(email: string) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

export default function CustomerSearchPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<BvshopCustomer[]>([]);
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
        `/api/customers/search?q=${encodeURIComponent(q.trim())}`
      );
      setItems(res.data || []);
      setMessage(res.message || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "查詢失敗");
      setItems([]);
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
            <div className="card-title">🔍 搜尋顧客</div>
            <div className="card-subtitle">MVP 目前支援輸入 BVSHOP 顧客 ID 查詢</div>
          </div>
        </div>
        <div className="search-bar">
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">BVSHOP 顧客 ID</label>
            <input
              className="field-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入 BVSHOP 顧客 ID（例：400000161）"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={search}
            disabled={loading || !q.trim()}
            style={{ marginTop: "22px" }}
          >
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> 查詢中</> : "🔍 查詢"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {message && !error && (
        <div className="alert alert-info">
          <span>ℹ️</span>
          <span>{message}</span>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && searched && items.length === 0 && !error && (
        <div className="card">
          <EmptyState
            icon="🔍"
            title="查無顧客"
            description="找不到符合的 BVSHOP 顧客，請確認 ID 是否正確，或顧客是否需要手動建立。"
          />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">查詢結果</div>
            <span className="badge badge-primary">{items.length} 筆</span>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>姓名</th>
                  <th>電話</th>
                  <th>Email</th>
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
                    <td>{maskPhone(c.phone)}</td>
                    <td>{maskEmail(c.email)}</td>
                    <td>
                      <Link to={`/customers/${c.id}`} className="btn btn-sm btn-primary">
                        查看 →
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
