import { Banner } from "fumadocs-ui/components/banner";
import { siteBanner } from "@/lib/shared";

export function SiteBanner() {
  return (
    <Banner
      // Scroll away with the page - sticky offset is handled by the navbar itself.
      changeLayout={false}
      height="auto"
      className="relative top-auto z-0 bg-[#f38020] px-3 py-2.5 text-xs leading-snug font-light text-white sm:text-sm"
    >
      {siteBanner.text}
    </Banner>
  );
}
