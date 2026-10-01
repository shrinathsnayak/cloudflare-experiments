import type { FormRow, SubmissionRow } from "../../src/types/form";

export function createMockDb() {
  const forms = new Map<string, FormRow>();
  const submissions: SubmissionRow[] = [];

  function statement(query: string, args: unknown[] = []) {
    return {
      async run() {
        return { meta: { changes: 0 } };
      },
      async first<T>() {
        if (query.startsWith("INSERT INTO forms")) {
          const row: FormRow = {
            id: args[0] as string,
            owner_email: args[1] as string,
            allowed_origin: args[2] as string | null,
            redirect_url: args[3] as string | null,
            created_at: 1_700_000_000,
          };
          forms.set(row.id, row);
          return row as T;
        }
        if (query.includes("FROM forms WHERE id = ?")) {
          return (forms.get(args[0] as string) ?? null) as T | null;
        }
        if (query.startsWith("INSERT INTO submissions")) {
          const row: SubmissionRow = {
            id: submissions.length + 1,
            form_id: args[0] as string,
            fields: args[1] as string,
            ip_hash: args[2] as string | null,
            user_agent: args[3] as string | null,
            created_at: 1_700_000_100,
          };
          submissions.push(row);
          return { id: row.id } as T;
        }
        return null;
      },
      async all<T>() {
        if (query.includes("FROM submissions WHERE form_id = ?")) {
          const rows = submissions
            .filter((s) => s.form_id === args[0])
            .reverse()
            .slice(0, args[1] as number);
          return { results: rows as T[] };
        }
        return { results: [] as T[] };
      },
    };
  }

  return {
    forms,
    submissions,
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
