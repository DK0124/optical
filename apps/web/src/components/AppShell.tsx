import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { GlassesIcon, HomeIcon, MenuIcon, SearchIcon } from "./icons/LineIcons";

const NAV_ITEMS = [
  { to: "/", icon: <HomeIcon size={16} />, label: "儀表板" },
  { to: "/customers/search", icon: <SearchIcon size={16} />, label: "查詢顧客" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // derive user from document cookie / meta (placeholder for Cloudflare Access)
  const userEmail = "dev@example.com";
  const userInitial = userEmail[0].toUpperCase();

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <div className="app-shell">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 39,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><GlassesIcon size={18} /></div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">眼鏡行管理系統</div>
            <div className="sidebar-brand-sub">BVSHOP 配鏡平台</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">主選單</div>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-link${isActive(item.to) ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          Optical Workspace · {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="開關側邊欄"
            >
              <MenuIcon size={18} />
            </button>
            <span className="topbar-title">BVSHOP 眼鏡行驗光配鏡管理系統</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-user-avatar">{userInitial}</div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-slate-600)" }}>
                {userEmail}
              </span>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
