import type { Env } from "../types";
import type {
  BvshopCustomerListItem,
  BvshopListMeta,
  BvshopLogistic,
  BvshopOrderResult,
  BvshopPayment,
} from "@optical/shared";

type BvshopMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function bvshopRequest<T>(
  env: Env,
  method: BvshopMethod,
  path: string,
  body?: unknown
): Promise<T> {
  if (!env.BVSHOP_API_BASE_URL || !env.BVSHOP_API_TOKEN) {
    throw new Error("BVSHOP_API_BASE_URL or BVSHOP_API_TOKEN is not configured.");
  }

  const base = env.BVSHOP_API_BASE_URL.replace(/\/$/, "");
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.BVSHOP_API_TOKEN}`
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await res.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message)
        : `BVSHOP API error ${res.status}`;

    const error = new Error(message) as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

function toQuery(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      usp.set(key, String(value));
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export interface BvshopCustomerPayload {
  phone: string;
  fullName: string;
  email: string;
  address: string;
  dealerCode?: string | null;
}

export interface BvshopOrderCreatePayload {
  customerId: number;
  paymentId: number;
  logisticId: number;
  remark: string;
  customizeItems: Array<{ name: string; quantity: number; price: number }>;
  customizeSales?: Array<{ name: string; price: number }>;
  cvs: { storeName: string; storeNum: string };
  customerRemark?: string;
  deposit?: number;
}

export const bvshopClient = {
  getCustomer(env: Env, id: string | number) {
    return bvshopRequest<{ data: BvshopCustomerListItem }>(env, "GET", `/customers/${id}`);
  },

  listCustomers(
    env: Env,
    params: {
      phone?: string;
      email?: string;
      dealerCode?: string;
      page?: number;
      limit?: number;
    }
  ) {
    return bvshopRequest<{ data: BvshopCustomerListItem[]; meta: BvshopListMeta }>(
      env,
      "GET",
      `/customers${toQuery(params)}`
    );
  },

  createCustomer(env: Env, payload: BvshopCustomerPayload) {
    return bvshopRequest<{ data: BvshopCustomerListItem }>(env, "POST", "/customers", payload);
  },

  updateCustomer(env: Env, id: string | number, payload: Partial<BvshopCustomerPayload>) {
    return bvshopRequest<{ data: BvshopCustomerListItem }>(env, "PUT", `/customers/${id}`, payload);
  },

  listOrders(
    env: Env,
    params: {
      customerId?: string | number;
      orderStatus?: string;
      paymentStatus?: string;
      logisticStatus?: string;
      dateType?: "created" | "paid" | "cancel";
      startAt?: string;
      endAt?: string;
      limit?: number;
      page?: number;
      withDetail?: 0 | 1;
    }
  ) {
    return bvshopRequest<{ data: any[]; meta: any }>(env, "GET", `/orders${toQuery(params)}`);
  },

  getOrder(env: Env, id: string | number) {
    return bvshopRequest<{ data: any }>(env, "GET", `/orders/${id}`);
  },

  listPayments(env: Env) {
    return bvshopRequest<{ data: BvshopPayment[] }>(env, "GET", "/payments");
  },

  listLogistics(env: Env) {
    return bvshopRequest<{ data: BvshopLogistic[] }>(env, "GET", "/logistics");
  },

  createOrder(env: Env, payload: BvshopOrderCreatePayload) {
    return bvshopRequest<{ data: BvshopOrderResult }>(env, "POST", "/orders", payload);
  },

  updateOrderRemark(env: Env, id: string | number, remark: string) {
    return bvshopRequest<{ data: any }>(env, "PUT", `/orders/${id}`, { remark });
  }
};
