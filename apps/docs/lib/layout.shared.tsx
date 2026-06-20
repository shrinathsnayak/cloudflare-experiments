import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe } from "lucide-react";
import { appName, gitConfig, portfolioUrl } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: "icon",
        url: portfolioUrl,
        label: "Portfolio",
        text: "Portfolio",
        icon: <Globe />,
        external: true,
      },
    ],
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
    searchToggle: {
      enabled: true,
    },
  };
}
