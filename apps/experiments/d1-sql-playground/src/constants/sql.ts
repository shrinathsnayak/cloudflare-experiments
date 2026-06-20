export const MAX_SQL_LENGTH = 2000;

export const ALLOWED_TABLES = ["experiments", "products"] as const;

export type AllowedTable = (typeof ALLOWED_TABLES)[number];
