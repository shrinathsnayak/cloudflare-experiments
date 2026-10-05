export type SearchProvider = "ceramic" | "exa" | "linkup";

export type SearchOptions = {
  query: string;
  provider?: SearchProvider;
  limit?: number;
  accountId: string;
  gatewayId: string;
};

export async function searchWeb({
  query,
  provider = "ceramic",
  limit = 5,
  accountId,
  gatewayId,
}: SearchOptions): Promise<unknown> {
  const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/web-search/${provider}`;

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Web Search API error: ${response.status} ${errorText}`);
  }

  return response.json();
}
