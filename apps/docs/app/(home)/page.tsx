import { HomePage } from "@/components/home-page";
import { createRootMetadata } from "@/lib/seo";

export const metadata = createRootMetadata();

export default function Page() {
  return <HomePage />;
}
