import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { BuyMeACoffeeLink } from "@/components/buy-me-a-coffee-link";
import {
  docsRoute,
  developersRoute,
  getBuyMeACoffeeUrl,
  githubRepoUrl,
  homeRoute,
  portfolioUrl,
} from "./shared";

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

const buyMeACoffeeLinks = getBuyMeACoffeeUrl()
  ? [
    {
      type: "custom" as const,
      children: <BuyMeACoffeeLink />,
    },
  ]
  : [];

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

/** Docs notebook layout with top navbar ( /docs/* ) */
export const docsLayoutOptions = {
  ...sharedLayout,
  nav: {
    ...nav,
    mode: "top" as const,
  },
  links: [
    {
      type: "main" as const,
      text: "Home",
      url: homeRoute,
      active: "url" as const,
    },
    {
      type: "main" as const,
      text: "What's New",
      url: `${docsRoute}/changelog`,
      active: "url" as const,
    },
    ...buyMeACoffeeLinks,
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
    {
      type: "main",
      text: "Developers",
      url: developersRoute,
      active: "url",
    },
    {
      type: "main",
      text: "Self-Hosted",
      url: `${docsRoute}/self-hosted`,
      active: "url",
    },
    {
      type: "main",
      text: "What's New",
      url: `${docsRoute}/changelog`,
      active: "url",
    },
    ...buyMeACoffeeLinks,
    portfolioLink,
  ],
};
