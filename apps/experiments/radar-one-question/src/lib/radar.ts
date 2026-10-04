export async function getRadarFact(
  domain?: string,
  asn?: string
): Promise<{ type: string; target: string; fact: string; ranking?: number }> {
  if (domain) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/radar/ranking/domain/${encodeURIComponent(domain)}`
    );

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      result?: { rank: number };
    };

    if (!data.success || !data.result) {
      throw new Error("Radar API returned unsuccessful response");
    }

    return {
      type: "domain",
      target: domain,
      fact: `Domain rank in global top domains`,
      ranking: data.result.rank,
    };
  }

  if (asn) {
    const asnNumber = asn.startsWith("AS") ? asn.substring(2) : asn;
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/radar/entities/asns/${asnNumber}`
    );

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      result?: { asn: { name: string; orgName: string; country: string } };
    };

    if (!data.success || !data.result) {
      throw new Error("Radar API returned unsuccessful response");
    }

    const { name, orgName, country } = data.result.asn;

    return {
      type: "asn",
      target: `AS${asnNumber}`,
      fact: `ASN owned by ${orgName} (${name}) in ${country}`,
    };
  }

  throw new Error("No domain or ASN provided");
}
