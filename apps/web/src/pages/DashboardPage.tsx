import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { ApiStatusBadge } from "../components/Badge";
import { ClipboardIcon, SearchIcon } from "../components/icons/LineIcons";

interface HealthResponse {
  ok: boolean;
  service: string;
  time: string;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    apiGet<HealthResponse>("/api/health")
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>儀表板</h1>
            <p className="page-header-desc">歡迎使用 BVSHOP 眼鏡行驗光配鏡管理系統</p>
          </div>
          {(health || healthError) && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)" }}>API 狀態</span>
              <ApiStatusBadge ok={health?.ok ?? false} />
            </div>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid-2" style={{ marginBottom: "var(--space-8)" }}>
        <Link to="/customers/search" style={{ textDecoration: "none" }}>
          <div className="card" style={{
            cursor: "pointer",
            transition: "box-shadow 0.15s, transform 0.15s",
            borderLeft: "4px solid var(--color-primary-500)",
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              (e.currentTarget as HTMLDivElement).style.transform = "";
            }}
          >
            <div style={{ marginBottom: "var(--space-3)", color: "var(--color-primary-700)" }}><SearchIcon size={24} /></div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-slate-800)", marginBottom: "var(--space-2)" }}>
              查詢顧客
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)" }}>
              輸入電話 / 姓名 / Email 查詢顧客資料、驗光歷史、配鏡記錄
            </div>
          </div>
        </Link>

        <div className="card" style={{ borderLeft: "4px solid var(--color-success-500)", opacity: 0.7 }}>
          <div style={{ marginBottom: "var(--space-3)", color: "var(--color-slate-700)" }}><ClipboardIcon size={24} /></div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-slate-800)", marginBottom: "var(--space-2)" }}>
            近期配鏡
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-500)" }}>
            近期配鏡紀錄（請先查詢顧客後操作）
          </div>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">第二階段操作流程</div>
            <div className="card-subtitle">依照以下步驟完成驗光配鏡作業</div>
          </div>
        </div>
        <div className="card-body">
          <ol style={{ paddingLeft: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[
              { step: "查詢 BVSHOP 顧客", desc: "輸入電話 / 姓名 / Email，同步快照至本系統" },
              { step: "新增驗光紀錄", desc: "輸入左右眼度數、PD、主視眼、用途等完整資料" },
              { step: "由驗光建立配鏡", desc: "選擇驗光紀錄，填入鏡框鏡片資料及金額" },
              { step: "複製 BVSHOP 訂單備註", desc: "系統自動產生符合規格的備註，手動貼至 BVSHOP 訂單" },
              { step: "（第二階段）自動建單", desc: "確認 payment/logistic/cvs 後啟用自動建單功能" },
            ].map((item, i) => (
              <li key={i} style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-700)" }}>
                <strong style={{ color: "var(--color-primary-700)" }}>{item.step}</strong>
                <span style={{ color: "var(--color-slate-500)", marginLeft: "8px" }}>— {item.desc}</span>
              </li>
            ))}
          </ol>

          <div className="divider" />

          {health && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-slate-400)" }}>
              後端服務：{health.service} · 時間：{new Date(health.time).toLocaleString("zh-TW")}
            </div>
          )}
          {healthError && (
            <div className="alert alert-warning" style={{ marginBottom: 0 }}>
              無法連線到後端 API。請確認 <code>pnpm dev:api</code> 已啟動（port 8787）。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
