export const DEFAULT_WAREHOUSE = "demo-warehouse";
export const MAX_QUERY_LENGTH = 4000;
export const R2_SQL_API_BASE = "https://api.sql.cloudflarestorage.com/api/v1/accounts";

export const DEMO_ROWS = [
  {
    event_type: "purchase",
    user_id: "user_123",
    product_id: "sku_42",
    amount: 19.99,
    ts: "2026-01-15T12:00:00.000Z",
  },
  {
    event_type: "page_view",
    user_id: "user_456",
    product_id: null,
    amount: null,
    ts: "2026-01-15T12:01:00.000Z",
  },
  {
    event_type: "purchase",
    user_id: "user_789",
    product_id: "sku_7",
    amount: 49.5,
    ts: "2026-01-15T12:02:00.000Z",
  },
] as const;
