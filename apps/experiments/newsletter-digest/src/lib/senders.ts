export function parseAllowedSenders(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Entries are full addresses (`news@example.com`) or domains (`example.com` / `@example.com`).
 * An empty list accepts everyone.
 */
export function isAllowedSender(addresses: Array<string | undefined>, allowed: string[]): boolean {
  if (allowed.length === 0) return true;
  return addresses.some((raw) => {
    const address = raw?.trim().toLowerCase();
    if (!address) return false;
    const domain = address.split("@").pop() ?? "";
    return allowed.some((entry) => {
      if (entry.includes("@") && !entry.startsWith("@")) return entry === address;
      const allowedDomain = entry.replace(/^@/, "");
      return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`);
    });
  });
}
