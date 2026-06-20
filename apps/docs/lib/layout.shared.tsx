import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe } from "lucide-react";
import { logoDimensions, logoPathPublic } from "@/lib/logo";
import { appName, gitConfig, portfolioUrl } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <img
            src={logoPathPublic}
            alt=""
            width={logoDimensions.nav.width}
            height={logoDimensions.nav.height}
          />
          {appName}
        </span>
      ),
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
