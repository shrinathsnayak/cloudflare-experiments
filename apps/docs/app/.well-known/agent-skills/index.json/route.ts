import {
  agentSkillsIndexResponse,
  agentSkillsOptionsResponse,
  headFromGet,
} from "@/lib/agent-skills";

/**
 * Agent Skills Discovery index (RFC v0.2.0).
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
