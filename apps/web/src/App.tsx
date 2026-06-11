import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import CustomerSearchPage from "./pages/CustomerSearchPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NewOptometryPage from "./pages/NewOptometryPage";
import OptometryDetailPage from "./pages/OptometryDetailPage";
import CreateGlassesOrderPage from "./pages/CreateGlassesOrderPage";
import GlassesOrderDetailPage from "./pages/GlassesOrderDetailPage";
import PrintOptometryPage from "./pages/PrintOptometryPage";
import PrintGlassesOrderPage from "./pages/PrintGlassesOrderPage";

export default function App() {
  const location = useLocation();
  const isPrintPage = location.pathname.startsWith("/print/");

  const routes = (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/customers/search" element={<CustomerSearchPage />} />
      <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
      <Route path="/customers/:customerId/optometry/new" element={<NewOptometryPage />} />
      <Route path="/optometry/:id" element={<OptometryDetailPage />} />
      <Route path="/optometry/:id/create-glasses-order" element={<CreateGlassesOrderPage />} />
      <Route path="/glasses-orders/:id" element={<GlassesOrderDetailPage />} />
      <Route path="/print/optometry/:id" element={<PrintOptometryPage />} />
      <Route path="/print/glasses-order/:id" element={<PrintGlassesOrderPage />} />
    </Routes>
  );

  return (
    <ToastProvider>
      {isPrintPage ? routes : <AppShell>{routes}</AppShell>}
    </ToastProvider>
  );
}
