import type { ItemRow } from "../../src/types/digest";

export function item(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    id: 1,
    from_address: "news@example.com",
    from_name: "Example News",
    subject: "Weekly update",
    summary: "- Point one\n- Point two",
    link: "https://example.com/post",
    received_at: 1_790_000_000,
    digested_at: null,
    ...overrides,
  };
}

export function createMockDb(initial: ItemRow[] = []) {
  const items: ItemRow[] = [...initial];

  function statement(query: string, args: unknown[] = []) {
    return {
      async run() {
        if (query.startsWith("UPDATE items SET digested_at")) {
          const [at, ...ids] = args as number[];
          for (const row of items) if (ids.includes(row.id)) row.digested_at = at;
          return { meta: { changes: ids.length } };
        }
        return { meta: { changes: 0 } };
      },
      async first<T>() {
        if (query.startsWith("INSERT INTO items")) {
          const row = item({
            id: items.length + 1,
            from_address: args[0] as string,
            from_name: args[1] as string | null,
            subject: args[2] as string,
            summary: args[3] as string,
            link: args[4] as string | null,
          });
          items.push(row);
          return { id: row.id } as T;
        }
        return null;
      },
      async all<T>() {
        const pending = query.includes("digested_at IS NULL");
        const rows = items.filter((r) => !pending || r.digested_at === null);
        return { results: rows as T[] };
      },
    };
  }

  return {
    items,
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
