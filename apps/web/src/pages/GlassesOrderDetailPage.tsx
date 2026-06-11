import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../api/client";

export default function GlassesOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    apiGet(`/api/glasses-orders/${id}`).then((res: any) => setOrder(res.data));
    apiGet(`/api/glasses-orders/${id}/order-note`).then((res: any) => setRemark(res.remark));
  }, [id]);

  if (!order) return <p>載入中...</p>;

  async function copy() {
    await navigator.clipboard.writeText(remark);
    alert("已複製 BVSHOP 訂單備註");
  }

  return (
    <section className="card">
      <h1>配鏡紀錄</h1>
      <p>配鏡 ID：{order.id}</p>
      <p>BVSHOP 顧客 ID：{order.bvshop_customer_id}</p>

      <h2>BVSHOP 訂單備註</h2>
      <button onClick={copy}>複製備註</button>
      <textarea className="remark" value={remark} readOnly />

      <h2>下一步</h2>
      <p className="muted">MVP 第一階段先複製備註，手動貼到 BVSHOP 訂單。確認 paymentId/logisticId/cvs 後，再開啟自動建單。</p>
    </section>
  );
}
