import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../api/client";

const emptyEye = {
  sph: null,
  cyl: null,
  axis: null,
  add: null,
  va: "",
  pd: null,
  prism: ""
};

function parseNum(value: string) {
  return value === "" ? null : Number(value);
}

export default function NewOptometryPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("");
  const [right, setRight] = useState<any>({ ...emptyEye });
  const [left, setLeft] = useState<any>({ ...emptyEye });
  const [note, setNote] = useState("");

  async function submit() {
    await apiPost("/api/optometry-records", {
      bvshopCustomerId: customerId,
      examDate: new Date().toISOString().slice(0, 10),
      staffName,
      dominantEye: "unknown",
      purpose: "daily",
      right,
      left,
      note
    });
    navigate(`/customers/${customerId}`);
  }

  function eyeInputs(label: string, eye: any, setEye: (v: any) => void) {
    return (
      <div className="eye-box">
        <h3>{label}</h3>
        {["sph", "cyl", "axis", "add", "pd"].map((k) => (
          <label key={k}>
            {k.toUpperCase()}
            <input
              type="number"
              step="0.01"
              value={eye[k] ?? ""}
              onChange={(e) => setEye({ ...eye, [k]: parseNum(e.target.value) })}
            />
          </label>
        ))}
        <label>VA<input value={eye.va ?? ""} onChange={(e) => setEye({ ...eye, va: e.target.value })} /></label>
        <label>PRISM<input value={eye.prism ?? ""} onChange={(e) => setEye({ ...eye, prism: e.target.value })} /></label>
      </div>
    );
  }

  return (
    <section className="card">
      <h1>新增驗光</h1>
      <label>驗光師<input value={staffName} onChange={(e) => setStaffName(e.target.value)} /></label>
      <div className="eyes">
        {eyeInputs("右眼 OD", right, setRight)}
        {eyeInputs("左眼 OS", left, setLeft)}
      </div>
      <label>備註<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <button onClick={submit}>儲存驗光</button>
    </section>
  );
}
