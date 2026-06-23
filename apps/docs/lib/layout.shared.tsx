import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { docsRoute, githubRepoUrl, homeRoute, portfolioUrl } from "./shared";

const nav = {
  title: <AppLogo />,
  url: homeRoute,
} as const;

const portfolioLink = {
  type: "icon" as const,
  url: portfolioUrl,
  label: "Portfolio",
  text: "Portfolio",
  icon: <Globe />,
  external: true,
};

const sharedLayout: Pick<BaseLayoutProps, "githubUrl" | "themeSwitch" | "searchToggle"> = {
  githubUrl: githubRepoUrl,
  themeSwitch: {
    enabled: true,
    mode: "light-dark-system",
  },
  searchToggle: {
    enabled: true,
  },
};

/** Docs sidebar layout ( /docs/* ) */
export const docsLayoutOptions: BaseLayoutProps = {
  ...sharedLayout,
  nav,
  links: [
    {
      type: "main",
      text: "Home",
      url: homeRoute,
      active: "url",
    },
    portfolioLink,
  ],
};

/** Marketing homepage layout ( / ) */
export const homeLayoutOptions: BaseLayoutProps = {
  ...sharedLayout,
  nav,
  links: [
    {
      type: "main",
      text: "Documentation",
      url: docsRoute,
      active: "nested-url",
    },
    portfolioLink,
  ],
};
