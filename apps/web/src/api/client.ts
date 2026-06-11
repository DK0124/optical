const API_BASE = "";
const DEV_EMAIL = "dev@example.com";

function baseHeaders() {
  return {
    "Content-Type": "application/json",
    "x-dev-user-email": DEV_EMAIL,
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: baseHeaders() });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: baseHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

async function toError(res: Response): Promise<Error> {
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  const msg = typeof data.message === "string" ? data.message : `API error ${res.status}`;
  return Object.assign(new Error(msg), { status: res.status, data });
}
