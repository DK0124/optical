import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <section className="card">
      <h1>眼鏡行驗光配鏡管理系統 MVP</h1>
      <p>第一版先完成：查 BVSHOP 顧客、建立驗光、建立配鏡、產生 BVSHOP 訂單備註。</p>
      <Link className="button" to="/customers/search">開始查顧客</Link>
    </section>
  );
}
