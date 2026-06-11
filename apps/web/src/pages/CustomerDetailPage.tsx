import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client";

export default function CustomerDetailPage() {
  const { customerId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiGet(`/api/customers/${customerId}`).then(setData).catch(console.error);
  }, [customerId]);

  if (!data) return <p>載入中...</p>;

  return (
    <section className="card">
      <h1>顧客資料</h1>
      <p>BVSHOP 顧客 ID：{customerId}</p>
      <p>姓名：{data.customer?.full_name || "未建立快照"}</p>
      <p>電話：{data.customer?.phone || ""}</p>

      <div className="actions">
        <Link className="button" to={`/customers/${customerId}/optometry/new`}>新增驗光</Link>
      </div>

      <h2>歷史驗光</h2>
      <table>
        <thead>
          <tr><th>日期</th><th>右眼</th><th>左眼</th><th>驗光師</th><th></th></tr>
        </thead>
        <tbody>
          {data.optometryRecords?.map((r: any) => (
            <tr key={r.id}>
              <td>{r.exam_date}</td>
              <td>{r.right_sph} / {r.right_cyl} x {r.right_axis}</td>
              <td>{r.left_sph} / {r.left_cyl} x {r.left_axis}</td>
              <td>{r.staff_name}</td>
              <td><Link to={`/optometry/${r.id}/create-glasses-order`}>配鏡</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>配鏡紀錄</h2>
      <table>
        <thead>
          <tr><th>日期</th><th>鏡框</th><th>鏡片</th><th>BV 訂單</th><th></th></tr>
        </thead>
        <tbody>
          {data.glassesOrders?.map((o: any) => (
            <tr key={o.id}>
              <td>{o.order_date}</td>
              <td>{o.frame_brand} {o.frame_model}</td>
              <td>{o.lens_index} {o.lens_type}</td>
              <td>{o.bvshop_order_uid || "-"}</td>
              <td><Link to={`/glasses-orders/${o.id}`}>查看</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
