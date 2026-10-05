import { logoDimensions, logoNavPathPublic } from "@/lib/logo";
import { appName } from "@/lib/shared";

export function AppLogo() {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
      <img
        src={logoNavPathPublic}
        alt=""
        width={logoDimensions.nav.width}
        height={logoDimensions.nav.height}
        className="size-7 shrink-0 rounded-md"
      />
      <span className="truncate whitespace-nowrap">{appName}</span>
    </span>
  );
}
