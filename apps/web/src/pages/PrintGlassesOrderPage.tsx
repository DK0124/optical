import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { LoadingSpinner } from "../components/Loading";

interface GlassesOrder {
  id: string;
  bvshop_customer_id: string;
  order_date: string;
  right_sph: number | null;
  right_cyl: number | null;
  right_axis: number | null;
  right_pd: number | null;
  left_sph: number | null;
  left_cyl: number | null;
  left_axis: number | null;
  left_pd: number | null;
  frame_brand: string | null;
  frame_model: string | null;
  frame_color: string | null;
  frame_size: string | null;
  frame_price: number;
  lens_index: string | null;
  lens_design: string | null;
  lens_type: string | null;
  lens_coating: string | null;
  lens_price: number;
  discount: number;
  total: number;
  deposit: number;
  balance: number;
  production_status: string;
  pickup_status: string;
  note: string | null;
}

interface CustomerDetailResponse {
  customer: {
    full_name: string;
    phone: string;
  } | null;
}

export default function PrintGlassesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<GlassesOrder | null>(null);
  const [customer, setCustomer] = useState<CustomerDetailResponse["customer"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const orderRes = await apiGet<{ data: GlassesOrder }>(`/api/glasses-orders/${id}`);
        setOrder(orderRes.data);
        const customerRes = await apiGet<CustomerDetailResponse>(`/api/customers/${orderRes.data.bvshop_customer_id}`);
        setCustomer(customerRes.customer);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="alert alert-error">找不到配鏡紀錄</div>;

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          列印
        </button>
      </div>
      <section className="print-document">
        <header className="print-header">
          <h1>BVSHOP 眼鏡行配鏡單</h1>
          <div>建立日期：{order.order_date}</div>
        </header>
        <div className="print-meta-grid">
          <div>配鏡單號：{order.id}</div>
          <div>顧客姓名：{customer?.full_name || "—"}</div>
          <div>顧客電話：{customer?.phone || "—"}</div>
          <div>製作狀態：{order.production_status}</div>
          <div>取件狀態：{order.pickup_status}</div>
          <div>BVSHOP 顧客：{order.bvshop_customer_id}</div>
        </div>

        <h2>處方度數</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>眼別</th>
              <th>SPH</th>
              <th>CYL</th>
              <th>AXIS</th>
              <th>PD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>右眼 OD</td>
              <td>{order.right_sph ?? "—"}</td>
              <td>{order.right_cyl ?? "—"}</td>
              <td>{order.right_axis ?? "—"}</td>
              <td>{order.right_pd ?? "—"}</td>
            </tr>
            <tr>
              <td>左眼 OS</td>
              <td>{order.left_sph ?? "—"}</td>
              <td>{order.left_cyl ?? "—"}</td>
              <td>{order.left_axis ?? "—"}</td>
              <td>{order.left_pd ?? "—"}</td>
            </tr>
          </tbody>
        </table>

        <h2>鏡框與鏡片</h2>
        <div className="print-meta-grid">
          <div>鏡框：{[order.frame_brand, order.frame_model].filter(Boolean).join(" ") || "—"}</div>
          <div>鏡框顏色/尺寸：{[order.frame_color, order.frame_size].filter(Boolean).join(" / ") || "—"}</div>
          <div>鏡片：{[order.lens_index, order.lens_design, order.lens_type].filter(Boolean).join(" ") || "—"}</div>
          <div>鍍膜：{order.lens_coating || "—"}</div>
        </div>

        <h2>金額明細</h2>
        <table className="print-table">
          <tbody>
            <tr><td>鏡框</td><td>NT$ {(order.frame_price || 0).toLocaleString()}</td></tr>
            <tr><td>鏡片</td><td>NT$ {(order.lens_price || 0).toLocaleString()}</td></tr>
            <tr><td>折扣</td><td>NT$ {(order.discount || 0).toLocaleString()}</td></tr>
            <tr><td>合計</td><td>NT$ {(order.total || 0).toLocaleString()}</td></tr>
            <tr><td>訂金</td><td>NT$ {(order.deposit || 0).toLocaleString()}</td></tr>
            <tr><td>尾款</td><td>NT$ {(order.balance || 0).toLocaleString()}</td></tr>
          </tbody>
        </table>

        <div className="print-note">備註：{order.note || "—"}</div>
        <div className="print-signature-grid">
          <div>製作簽名：__________________</div>
          <div>取件簽名：__________________</div>
        </div>
      </section>
    </div>
  );
}
