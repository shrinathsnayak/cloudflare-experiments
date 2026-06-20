import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe } from "lucide-react";
import { appName, docsRoute, gitConfig, homeRoute, portfolioUrl } from "./shared";

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const sharedLayout: Pick<BaseLayoutProps, "githubUrl" | "themeSwitch" | "searchToggle"> = {
  githubUrl,
  themeSwitch: {
    enabled: true,
    mode: "light-dark-system",
  },
  searchToggle: {
    enabled: true,
  },
};

/** Docs sidebar layout ( /docs/* ) */
export function docsLayoutOptions(): BaseLayoutProps {
  return {
    ...sharedLayout,
    nav: {
      title: appName,
      url: homeRoute,
    },
    links: [
      {
        type: "main",
        text: "Home",
        url: homeRoute,
        active: "url",
      },
      {
        type: "icon",
        url: portfolioUrl,
        label: "Portfolio",
        text: "Portfolio",
        icon: <Globe />,
        external: true,
      },
    ],
  };
}

/** Marketing homepage layout ( / ) */
export function homeLayoutOptions(): BaseLayoutProps {
  return {
    ...sharedLayout,
    nav: {
      title: appName,
      url: homeRoute,
    },
    links: [
      {
        type: "main",
        text: "Documentation",
        url: docsRoute,
        active: "nested-url",
      },
      {
        type: "icon",
        url: portfolioUrl,
        label: "Portfolio",
        text: "Portfolio",
        icon: <Globe />,
        external: true,
      },
    ],
  };
}

/** @deprecated use docsLayoutOptions */
export function baseOptions(): BaseLayoutProps {
  return docsLayoutOptions();
}
