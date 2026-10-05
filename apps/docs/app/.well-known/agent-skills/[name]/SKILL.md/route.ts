import {
  agentSkillMdResponse,
  agentSkillsOptionsResponse,
  headFromGet,
} from "@/lib/agent-skills";

type RouteContext = {
  params: Promise<{ name: string }>;
};

/**
 * Serve a single skill-md artifact for Agent Skills Discovery.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params;
  return agentSkillMdResponse(name);
}

export async function HEAD(_request: Request, context: RouteContext) {
  const { name } = await context.params;
  return headFromGet(agentSkillMdResponse(name));
}

export function OPTIONS() {
  return agentSkillsOptionsResponse();
}
