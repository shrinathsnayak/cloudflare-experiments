import { getBuyMeACoffeeUrl } from "@/lib/shared";
import { Coffee } from "lucide-react";

export function BuyMeACoffeeLink() {
  const href = getBuyMeACoffeeUrl();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#FFDD00] px-3 py-1.5 text-sm font-semibold text-[#0d0c22] shadow-sm transition-[filter,transform] hover:brightness-105 active:scale-[0.98]"
    >
      <Coffee className="size-3.5 shrink-0" aria-hidden />
      Buy Me a Coffee
    </a>
  );
}
