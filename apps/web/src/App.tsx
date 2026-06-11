import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import CustomerSearchPage from "./pages/CustomerSearchPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import NewOptometryPage from "./pages/NewOptometryPage";
import OptometryDetailPage from "./pages/OptometryDetailPage";
import CreateGlassesOrderPage from "./pages/CreateGlassesOrderPage";
import GlassesOrderDetailPage from "./pages/GlassesOrderDetailPage";

export default function App() {
  return (
    <ToastProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers/search" element={<CustomerSearchPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="/customers/:customerId/optometry/new" element={<NewOptometryPage />} />
          <Route path="/optometry/:id" element={<OptometryDetailPage />} />
          <Route path="/optometry/:id/create-glasses-order" element={<CreateGlassesOrderPage />} />
          <Route path="/glasses-orders/:id" element={<GlassesOrderDetailPage />} />
        </Routes>
      </AppShell>
    </ToastProvider>
  );
}
