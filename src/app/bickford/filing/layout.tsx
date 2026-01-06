/**
 * Bickford Filing Layout
 * Wraps filing UI with Canon and OPTR providers
 */

import { CanonProvider } from "@/lib/stores/canonStore";
import { OPTRProvider } from "@/lib/stores/optrStore";

export default function FilingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CanonProvider>
      <OPTRProvider>{children}</OPTRProvider>
    </CanonProvider>
  );
}
