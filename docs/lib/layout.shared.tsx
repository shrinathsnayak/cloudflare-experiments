import Image from "next/image";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/logo-light.svg"
            alt={appName}
            width={24}
            height={24}
            className="dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt={appName}
            width={24}
            height={24}
            className="hidden dark:block"
          />
          {appName}
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
