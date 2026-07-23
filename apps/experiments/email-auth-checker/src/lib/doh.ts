import { DOH_BASE, DOH_TIMEOUT_MS } from "../constants/defaults";

type DohAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};

type DohResponse = {
  Status: number;
  Answer?: DohAnswer[];
};

export async function queryDoh(name: string, type: string): Promise<string[]> {
  const url = `${DOH_BASE}?name=${encodeURIComponent(name)}&type=${type}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`DoH HTTP ${res.status}`);
    }
    const json = (await res.json()) as DohResponse;
    if (json.Status !== 0 || !json.Answer) return [];
    return json.Answer.map((a) => a.data.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
  } catch (e) {
    clearTimeout(timeout);
    throw e instanceof Error ? e : new Error("DoH query failed");
  }
}
