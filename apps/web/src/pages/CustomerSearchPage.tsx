import { useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";

export default function CustomerSearchPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function search() {
    setError("");
    try {
      const res = await apiGet<{ data: any[] }>(`/api/customers/search?q=${encodeURIComponent(q)}`);
      setItems(res.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "查詢失敗");
    }
  }

  return (
    <section className="card">
      <h1>查詢 BVSHOP 顧客</h1>
      <p className="muted">MVP 第一版先支援輸入 BVSHOP 顧客 ID。</p>
      <div className="row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="輸入 BVSHOP 顧客 ID" />
        <button onClick={search}>查詢</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>電話</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.fullName}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td><Link to={`/customers/${c.id}`}>開啟</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
