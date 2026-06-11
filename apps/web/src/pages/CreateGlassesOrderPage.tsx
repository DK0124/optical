import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";

export default function CreateGlassesOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [frameBrand, setFrameBrand] = useState("");
  const [frameModel, setFrameModel] = useState("");
  const [framePrice, setFramePrice] = useState(0);
  const [lensIndex, setLensIndex] = useState("1.67");
  const [lensType, setLensType] = useState("single_vision");
  const [lensPrice, setLensPrice] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    apiGet(`/api/optometry-records/${id}`).then((res: any) => setRecord(res.data));
  }, [id]);

  if (!record) return <p>載入中...</p>;

  async function submit() {
    const payload = {
      optometryRecordId: record.id,
      bvshopCustomerId: record.bvshop_customer_id,
      orderDate: new Date().toISOString().slice(0, 10),
      prescription: {
        right: {
          sph: record.right_sph,
          cyl: record.right_cyl,
          axis: record.right_axis,
          add: record.right_add,
          pd: record.right_pd,
          oh: null,
          va: record.right_va,
          prism: record.right_prism
        },
        left: {
          sph: record.left_sph,
          cyl: record.left_cyl,
          axis: record.left_axis,
          add: record.left_add,
          pd: record.left_pd,
          oh: null,
          va: record.left_va,
          prism: record.left_prism
        }
      },
      frame: { brand: frameBrand, model: frameModel, price: framePrice },
      lens: { index: lensIndex, type: lensType, coating: ["blue_cut", "anti_reflection"], price: lensPrice },
      amount: {
        discount: 0,
        total: Number(framePrice) + Number(lensPrice),
        deposit: 0,
        balance: Number(framePrice) + Number(lensPrice)
      },
      note
    };

    const res: any = await apiPost("/api/glasses-orders", payload);
    navigate(`/glasses-orders/${res.data.id}`);
  }

  return (
    <section className="card">
      <h1>由驗光建立配鏡</h1>
      <p>驗光紀錄：{record.id}</p>
      <p>右眼：{record.right_sph} / {record.right_cyl} x {record.right_axis}</p>
      <p>左眼：{record.left_sph} / {record.left_cyl} x {record.left_axis}</p>

      <label>鏡框品牌<input value={frameBrand} onChange={(e) => setFrameBrand(e.target.value)} /></label>
      <label>鏡框型號<input value={frameModel} onChange={(e) => setFrameModel(e.target.value)} /></label>
      <label>鏡框價格<input type="number" value={framePrice} onChange={(e) => setFramePrice(Number(e.target.value))} /></label>
      <label>鏡片折射率<input value={lensIndex} onChange={(e) => setLensIndex(e.target.value)} /></label>
      <label>鏡片類型<input value={lensType} onChange={(e) => setLensType(e.target.value)} /></label>
      <label>鏡片價格<input type="number" value={lensPrice} onChange={(e) => setLensPrice(Number(e.target.value))} /></label>
      <label>備註<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>

      <button onClick={submit}>建立配鏡紀錄</button>
    </section>
  );
}
