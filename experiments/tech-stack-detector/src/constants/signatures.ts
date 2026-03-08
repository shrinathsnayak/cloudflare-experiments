/** Header names (lowercase) that indicate a technology, and the tech label. */
export const HEADER_SIGNATURES: [string, string][] = [
  ["x-powered-by", "Node.js"],
  ["x-vercel-id", "Vercel"],
  ["x-vercel-cache", "Vercel"],
  ["x-nextjs-cache", "Next.js"],
  ["cf-ray", "Cloudflare"],
  ["x-cache", "CDN"],
  ["server", "Server"],
  ["x-generator", "Generator"],
  ["x-drupal-cache", "Drupal"],
  ["x-varnish", "Varnish"],
  ["x-aspnet-version", "ASP.NET"],
];

/** HTML/script patterns (regex source) that indicate a technology. */
export const HTML_SIGNATURES: [RegExp, string][] = [
  [/__NEXT_DATA__/i, "Next.js"],
  [/react-dom|"react"|'react'/i, "React"],
  [/wp-content|wp-includes|wordpress/i, "WordPress"],
  [/vue\.min\.js|"vue"|'vue'/i, "Vue"],
  [/angular\.js|ng-app|"@angular/i, "Angular"],
  [/nuxt\.js|__NUXT__/i, "Nuxt"],
  [/svelte|svelte\/internal/i, "Svelte"],
  [/cloudflare/i, "Cloudflare"],
  [/vercel\.(com|insights)/i, "Vercel"],
  [/netlify/i, "Netlify"],
  [/ghost-/i, "Ghost"],
  [/shopify/i, "Shopify"],
  [/webpack/i, "Webpack"],
  [/vite\/client/i, "Vite"],
  [/jquery/i, "jQuery"],
  [/bootstrap/i, "Bootstrap"],
  [/tailwind/i, "Tailwind CSS"],
];
