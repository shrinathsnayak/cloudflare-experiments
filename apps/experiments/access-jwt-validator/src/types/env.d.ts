/// <reference types="@cloudflare/workers-types" />

export interface Env {
  /** e.g. https://yourteam.cloudflareaccess.com */
  TEAM_DOMAIN?: string;
  /** Application Audience (AUD) tag from Zero Trust → Access → Applications */
  POLICY_AUD?: string;
}
