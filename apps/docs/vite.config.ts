import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

/** Vinext sets per-environment optimizeDeps; merge excludes so RSC/client stay consistent. */
const RSC_INCONSISTENT_DEPS = ["lucide-react"] as const;

function mergeOptimizeDepsExclude(packages: readonly string[]): Plugin {
  return {
    name: "docs:merge-optimize-deps-exclude",
    config(config) {
      const merged = new Set(packages);
      for (const item of config.optimizeDeps?.exclude ?? []) {
        merged.add(item);
      }

      const apply = (target: { optimizeDeps?: { exclude?: string[] } } | undefined) => {
        if (!target) return;
        target.optimizeDeps ??= {};
        target.optimizeDeps.exclude = [
          ...new Set([...(target.optimizeDeps.exclude ?? []), ...merged]),
        ];
      };

      apply(config);
      if (config.environments) {
        for (const env of Object.values(config.environments)) {
          apply(env);
        }
      }
    },
  };
}

/**
 * Vinext's MDX proxy only treats plugins named `mdx` or `@mdx-js/rollup` as
 * "user MDX". Fumadocs registers `fumadocs-mdx*`, so without this stub vinext
 * throws on content MDX HMR: "Encountered MDX module … no MDX plugin".
 * No-op transform — fumadocs-mdx owns content under `content/docs`.
 */
function vinextFumadocsMdxCompat(): Plugin {
  return { name: "mdx" };
}

export default defineConfig({
  // postcss.config.mjs stays for `next build`; Vite uses the Tailwind plugin instead.
  css: { postcss: {} },
  optimizeDeps: {
    exclude: [...RSC_INCONSISTENT_DEPS],
  },
  plugins: [
    tailwindcss(),
    mdx(),
    vinextFumadocsMdxCompat(),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    mergeOptimizeDepsExclude(RSC_INCONSISTENT_DEPS),
  ],
});
