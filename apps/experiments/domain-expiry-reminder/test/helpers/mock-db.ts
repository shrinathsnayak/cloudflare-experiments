import type { DomainRow } from "../../src/types/domain";

export type ReminderRecord = {
  domain_id: number;
  kind: string;
  threshold_days: number;
  expires_at: string;
};

export function createMockDb() {
  const domains = new Map<number, DomainRow>();
  const reminders: ReminderRecord[] = [];
  let nextId = 1;

  function statement(query: string, args: unknown[] = []) {
    return {
      async run() {
        if (query.startsWith("DELETE FROM domains")) {
          return { meta: { changes: domains.delete(Number(args[0])) ? 1 : 0 } };
        }
        if (query.startsWith("DELETE FROM reminders")) {
          return { meta: { changes: 0 } };
        }
        if (query.startsWith("UPDATE domains")) {
          const row = domains.get(Number(args[3]));
          if (row) {
            row.registration_expires_at = args[0] as string | null;
            row.certificate_expires_at = args[1] as string | null;
            row.last_checked_at = args[2] as number;
          }
          return { meta: { changes: row ? 1 : 0 } };
        }
        if (query.startsWith("INSERT OR IGNORE INTO reminders")) {
          reminders.push({
            domain_id: args[0] as number,
            kind: args[1] as string,
            threshold_days: args[2] as number,
            expires_at: args[3] as string,
          });
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      },
      async first<T>() {
        if (query.startsWith("INSERT INTO domains")) {
          const row: DomainRow = {
            id: nextId++,
            domain: args[0] as string,
            alert_email: args[1] as string,
            registration_expires_at: null,
            certificate_expires_at: null,
            last_checked_at: null,
            created_at: 1_700_000_000,
          };
          domains.set(row.id, row);
          return row as T;
        }
        if (query.includes("FROM domains WHERE id = ?")) {
          return (domains.get(Number(args[0])) ?? null) as T | null;
        }
        if (query.includes("FROM reminders")) {
          const found = reminders.find(
            (r) =>
              r.domain_id === args[0] &&
              r.kind === args[1] &&
              r.threshold_days === args[2] &&
              r.expires_at === args[3]
          );
          return (found ? { id: 1 } : null) as T | null;
        }
        return null;
      },
      async all<T>() {
        if (query.includes("FROM domains ORDER BY id ASC")) {
          return { results: [...domains.values()] as T[] };
        }
        return { results: [] as T[] };
      },
    };
  }

  return {
    domains,
    reminders,
    prepare(query: string) {
      return {
        bind: (...args: unknown[]) => statement(query, args),
        run: () => statement(query).run(),
        first: <T>() => statement(query).first<T>(),
        all: <T>() => statement(query).all<T>(),
      };
    },
  };
}
