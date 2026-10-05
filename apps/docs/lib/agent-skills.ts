import {
  agentSkillArtifacts,
  agentSkillsIndex,
  type AgentSkillArtifact,
} from "@/lib/generated/agent-skills-data";
import { MARKDOWN_CACHE_CONTROL, applySecurityHeaders } from "@/lib/security-headers";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
const CORS_ORIGIN = "*";

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function withDiscoveryHeaders(headers: Headers): Headers {
  applySecurityHeaders(headers);
  headers.set("Access-Control-Allow-Origin", CORS_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Cache-Control", MARKDOWN_CACHE_CONTROL);
  return headers;
}

export function getAgentSkillsIndex(): typeof agentSkillsIndex {
  return agentSkillsIndex;
}

export function getAgentSkillArtifact(name: string): AgentSkillArtifact | undefined {
  return agentSkillArtifacts[name];
}

export function agentSkillsIndexResponse(): Response {
  const body = `${JSON.stringify(agentSkillsIndex, null, 2)}\n`;
  const headers = withDiscoveryHeaders(
    new Headers({
      "Content-Type": JSON_CONTENT_TYPE,
    }),
  );
  return new Response(body, { headers });
}

export function agentSkillMdResponse(name: string): Response {
  const skill = getAgentSkillArtifact(name);
  if (!skill) {
    const headers = withDiscoveryHeaders(new Headers({ "Content-Type": "text/plain; charset=utf-8" }));
    return new Response("Not Found", { status: 404, headers });
  }

  const bytes = decodeBase64(skill.bodyBase64);
  const headers = withDiscoveryHeaders(
    new Headers({
      "Content-Type": MARKDOWN_CONTENT_TYPE,
      ETag: `"${skill.digest}"`,
    }),
  );
  return new Response(bytes, { headers });
}

export function agentSkillsOptionsResponse(): Response {
  const headers = withDiscoveryHeaders(new Headers());
  return new Response(null, { status: 204, headers });
}

export function headFromGet(response: Response): Response {
  return new Response(null, { status: response.status, headers: response.headers });
}
