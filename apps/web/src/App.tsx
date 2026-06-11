import { Link, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CustomerSearchPage from "./pages/CustomerSearchPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NewOptometryPage from "./pages/NewOptometryPage";
import CreateGlassesOrderPage from "./pages/CreateGlassesOrderPage";
import GlassesOrderDetailPage from "./pages/GlassesOrderDetailPage";

export default function App() {
  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand">BVSHOP 眼鏡行驗光配鏡系統</Link>
        <nav>
          <Link to="/customers/search">查顧客</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers/search" element={<CustomerSearchPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="/customers/:customerId/optometry/new" element={<NewOptometryPage />} />
          <Route path="/optometry/:id/create-glasses-order" element={<CreateGlassesOrderPage />} />
          <Route path="/glasses-orders/:id" element={<GlassesOrderDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
