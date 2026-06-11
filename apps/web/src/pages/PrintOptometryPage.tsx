import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { LoadingSpinner } from "../components/Loading";

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
  right_pd: number | null;
  right_va: string | null;
  right_prism: string | null;
  left_sph: number | null;
  left_cyl: number | null;
  left_axis: number | null;
  left_add: number | null;
  left_pd: number | null;
  left_va: string | null;
  left_prism: string | null;
  note: string | null;
}

interface CustomerDetailResponse {
  customer: {
    full_name: string;
    phone: string;
  } | null;
}

export default function PrintOptometryPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<OptometryRecord | null>(null);
  const [customer, setCustomer] = useState<CustomerDetailResponse["customer"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const recordRes = await apiGet<{ data: OptometryRecord }>(`/api/optometry-records/${id}`);
        setRecord(recordRes.data);
        const customerRes = await apiGet<CustomerDetailResponse>(`/api/customers/${recordRes.data.bvshop_customer_id}`);
        setCustomer(customerRes.customer);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!record) return <div className="alert alert-error">找不到驗光紀錄</div>;

  const renderEye = (side: "right" | "left") => (
    <tr>
      <td>{side === "right" ? "右眼 OD" : "左眼 OS"}</td>
      <td>{record[`${side}_sph` as const] ?? "—"}</td>
      <td>{record[`${side}_cyl` as const] ?? "—"}</td>
      <td>{record[`${side}_axis` as const] ?? "—"}</td>
      <td>{record[`${side}_add` as const] ?? "—"}</td>
      <td>{record[`${side}_va` as const] ?? "—"}</td>
      <td>{record[`${side}_pd` as const] ?? "—"}</td>
      <td>{record[`${side}_prism` as const] ?? "—"}</td>
    </tr>
  );

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          列印
        </button>
      </div>
      <section className="print-document">
        <header className="print-header">
          <h1>BVSHOP 眼鏡行驗光單</h1>
          <div>日期：{record.exam_date}</div>
        </header>
        <div className="print-meta-grid">
          <div>顧客姓名：{customer?.full_name || "—"}</div>
          <div>顧客電話：{customer?.phone || "—"}</div>
          <div>驗光師：{record.staff_name || "—"}</div>
          <div>主視眼：{record.dominant_eye || "—"}</div>
          <div>用途：{record.purpose || "—"}</div>
          <div>驗光單號：{record.id}</div>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>眼別</th>
              <th>SPH</th>
              <th>CYL</th>
              <th>AXIS</th>
              <th>ADD</th>
              <th>VA</th>
              <th>PD</th>
              <th>PRISM</th>
            </tr>
          </thead>
          <tbody>
            {renderEye("right")}
            {renderEye("left")}
          </tbody>
        </table>
        <div className="print-note">備註：{record.note || "—"}</div>
        <div className="print-signature-grid">
          <div>驗光師簽名：__________________</div>
          <div>顧客簽名：__________________</div>
        </div>
      </section>
    </div>
  );
}
