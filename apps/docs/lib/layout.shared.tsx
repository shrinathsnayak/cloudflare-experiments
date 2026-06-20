import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { logoDimensions, logoPathPublic } from "@/lib/logo";
import { appName, gitConfig } from "./shared";

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
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
    searchToggle: {
      enabled: true,
    },
  };
}
