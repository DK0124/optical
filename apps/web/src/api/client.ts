const API_BASE = "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "x-dev-user-email": "dev@example.com"
    }
  });

  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dev-user-email": "dev@example.com"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw await toError(res);
  return res.json();
}

async function toError(res: Response) {
  const data = await res.json().catch(() => ({}));
  return new Error(data.message || `API error ${res.status}`);
}
