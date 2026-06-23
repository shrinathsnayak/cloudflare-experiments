import { logoDimensions, logoNavPathPublic } from "@/lib/logo";
import { appName } from "@/lib/shared";

export function AppLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={logoNavPathPublic}
        alt=""
        width={logoDimensions.nav.width}
        height={logoDimensions.nav.height}
        className="size-7 rounded-md"
      />
      <span>{appName}</span>
    </span>
  );
}
