import { Banner } from "fumadocs-ui/components/banner";
import { siteBanner } from "@/lib/shared";

export function SiteBanner() {
  return (
    <Banner
      height="2rem"
      changeLayout
      className="bg-[#f38020] text-sm text-white font-light"
    >
      {siteBanner.text}
    </Banner>
  );
}
