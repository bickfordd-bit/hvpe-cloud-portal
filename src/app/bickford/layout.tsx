import { CanonProvider } from "@/lib/stores/canonStore";
import { OPTRProvider } from "@/lib/stores/optrStore";
import { ValuationProvider } from "@/lib/stores/valuationStore";
import { BranchOPTRProvider } from "@/lib/stores/branchOPTRStore";

export default function BickfordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CanonProvider>
      <OPTRProvider>
        <ValuationProvider>
          <BranchOPTRProvider>{children}</BranchOPTRProvider>
        </ValuationProvider>
      </OPTRProvider>
    </CanonProvider>
  );
}
