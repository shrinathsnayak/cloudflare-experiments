import type { DependencyResponse } from "../types/analyze";
import { resolveUrl } from "./url";

function extractScripts(html: string): string[] {
  const urls: string[] = [];
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function extractStylesheets(html: string): string[] {
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  const re = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  const re2 = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  while ((m = re2.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function extractImages(html: string): string[] {
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  const re2 = /<source[^>]+src=["']([^"']+)["']/gi;
  while ((m = re2.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function extractFonts(html: string): string[] {
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  const re =
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:preload|stylesheet)["'][^>]+as=["']font["']/gi;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  const re2 = /url\(["']?([^"')]+\.(?:woff2?|ttf|otf|eot))["']?\)/gi;
  while ((m = re2.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function extractIframes(html: string): string[] {
  const urls: string[] = [];
  const re = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) urls.push(m[1].trim());
  return urls;
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function parseDependencies(html: string, baseUrl: string): DependencyResponse {
  const resolve = (href: string) => resolveUrl(baseUrl, href);
  return {
    scripts: unique(extractScripts(html).map(resolve)),
    stylesheets: unique(extractStylesheets(html).map(resolve)),
    images: unique(extractImages(html).map(resolve)),
    fonts: unique(extractFonts(html).map(resolve)),
    iframes: unique(extractIframes(html).map(resolve)),
  };
}
