import type { TechStackResponse } from "../types/detect";
import { HEADER_SIGNATURES, HTML_SIGNATURES } from "../constants/signatures";

function detectFromHeaders(headers: Record<string, string>): { techs: string[]; meta: Record<string, string> } {
  const techs: string[] = [];
  const meta: Record<string, string> = {};
  for (const [name, label] of HEADER_SIGNATURES) {
    const value = headers[name];
    if (value) {
      techs.push(label);
      meta[name] = value;
    }
  }
  return { techs, meta };
}

function detectFromHtml(html: string): string[] {
  const techs: string[] = [];
  for (const [re, label] of HTML_SIGNATURES) {
    if (re.test(html)) techs.push(label);
  }
  return techs;
}

export function detectTechStack(html: string, headers: Record<string, string>): TechStackResponse {
  const { techs: headerTechs, meta } = detectFromHeaders(headers);
  const htmlTechs = detectFromHtml(html);
  const technologies = [...new Set([...headerTechs, ...htmlTechs])].sort();
  const headerMeta: Record<string, string> = {};
  for (const [name, label] of HEADER_SIGNATURES) {
    const value = headers[name];
    if (value) headerMeta[name] = value;
  }
  return {
    technologies,
    headers: headerMeta,
    meta: Object.keys(meta).length ? meta : headerMeta,
  };
}
