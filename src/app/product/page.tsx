import { StaticPage } from "@/components/pages/StaticPage";

export default function ProductPage() {
  return (
    <StaticPage
      title="Product Overview"
      subtitle="High Velocity Profit Engine — Bickford Technologies"
      paragraphs={[
        "HVPE is a live trading portal that blends packetized execution, live risk controls, and strategy governance in a single surface. Operators can monitor live loops, allocate capital, and trigger kill switches without leaving the portal.",
        "Modules span trading (packets, arbitrator, investor view), licensing and billing, and compliance pages so teams can stay inside one control plane.",
      ]}
    />
  );
}
