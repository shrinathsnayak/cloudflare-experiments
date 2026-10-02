import type { SUPPORTED_LANGS } from "../constants/defaults";

export type Lang = (typeof SUPPORTED_LANGS)[number];

export interface ExtractedArticle {
  title: string | null;
  text: string;
}

export interface PreparedArticle extends ExtractedArticle {
  chunks: string[];
  chars: number;
  truncated: boolean;
}

export interface TextResponse {
  url: string;
  title: string | null;
  text: string;
  chars: number;
  chunks: number;
  truncated: boolean;
}
