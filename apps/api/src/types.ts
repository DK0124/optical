export interface Env {
  DB: D1Database;
  BVSHOP_API_BASE_URL: string;
  BVSHOP_API_TOKEN: string;
  DEFAULT_COMPANY_ID: string;
  DEFAULT_PAYMENT_ID?: string;
  DEFAULT_LOGISTIC_ID?: string;
  DEFAULT_CVS_STORE_NAME?: string;
  DEFAULT_CVS_STORE_NUM?: string;
  REQUIRE_AUTH?: string;
  ENABLE_REAL_ORDER?: string;
}

export type AppVariables = {
  companyId: string;
  userEmail: string | null;
  userId: string | null;
};
