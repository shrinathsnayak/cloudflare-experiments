import {
  agentSkillsIndexResponse,
  agentSkillsOptionsResponse,
  headFromGet,
} from "@/lib/agent-skills";

/**
 * Internal route for the Agent Skills Discovery index (RFC v0.2.0).
 * Public URI is `/.well-known/agent-skills/index.json` (rewritten in proxy.ts).
 * Vinext/Next file routing does not reliably register dot-folders under `app/`.
 * @see https://github.com/cloudflare/agent-skills-discovery-rfc
 */
export function GET() {
  return agentSkillsIndexResponse();
}

export function HEAD() {
  return headFromGet(agentSkillsIndexResponse());
}

export function OPTIONS() {
  return agentSkillsOptionsResponse();
}
