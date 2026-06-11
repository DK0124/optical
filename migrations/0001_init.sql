CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bvshop_store_domain TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_company_email
ON users(company_id, email);

CREATE TABLE IF NOT EXISTS customers_snapshot (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  bvshop_customer_id TEXT NOT NULL,
  bvshop_customer_no TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  dealer_code TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_company_bv_id
ON customers_snapshot(company_id, bvshop_customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_company_phone
ON customers_snapshot(company_id, phone);

CREATE INDEX IF NOT EXISTS idx_customers_company_name
ON customers_snapshot(company_id, full_name);

CREATE TABLE IF NOT EXISTS optometry_records (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  bvshop_customer_id TEXT NOT NULL,

  exam_date TEXT NOT NULL,
  staff_id TEXT,
  staff_name TEXT,

  dominant_eye TEXT DEFAULT 'unknown',
  purpose TEXT DEFAULT 'daily',

  right_sph REAL,
  right_cyl REAL,
  right_axis INTEGER,
  right_add REAL,
  right_va TEXT,
  right_pd REAL,
  right_prism TEXT,

  left_sph REAL,
  left_cyl REAL,
  left_axis INTEGER,
  left_add REAL,
  left_va TEXT,
  left_pd REAL,
  left_prism TEXT,

  note TEXT,
  status TEXT NOT NULL DEFAULT 'active',

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_optometry_customer
ON optometry_records(company_id, bvshop_customer_id, exam_date);

CREATE TABLE IF NOT EXISTS glasses_orders (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  optometry_record_id TEXT,
  bvshop_customer_id TEXT NOT NULL,

  bvshop_order_id TEXT,
  bvshop_order_uid TEXT,

  order_date TEXT NOT NULL,

  right_sph REAL,
  right_cyl REAL,
  right_axis INTEGER,
  right_add REAL,
  right_pd REAL,
  right_oh REAL,
  right_va TEXT,
  right_prism TEXT,

  left_sph REAL,
  left_cyl REAL,
  left_axis INTEGER,
  left_add REAL,
  left_pd REAL,
  left_oh REAL,
  left_va TEXT,
  left_prism TEXT,

  frame_brand TEXT,
  frame_model TEXT,
  frame_color TEXT,
  frame_size TEXT,
  frame_price INTEGER DEFAULT 0,

  lens_brand TEXT,
  lens_series TEXT,
  lens_type TEXT,
  lens_index TEXT,
  lens_design TEXT,
  lens_coating TEXT,
  lens_price INTEGER DEFAULT 0,

  discount INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  deposit INTEGER DEFAULT 0,
  balance INTEGER DEFAULT 0,

  production_status TEXT DEFAULT 'pending',
  pickup_status TEXT DEFAULT 'not_picked_up',

  bvshop_remark TEXT,
  note TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_glasses_customer
ON glasses_orders(company_id, bvshop_customer_id, order_date);

CREATE INDEX IF NOT EXISTS idx_glasses_bv_order
ON glasses_orders(company_id, bvshop_order_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  user_id TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  before_json TEXT,
  after_json TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
