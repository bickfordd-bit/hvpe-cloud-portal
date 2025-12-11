import { StaticPage } from "@/components/pages/StaticPage";

export default function TradingRulesPage() {
  return (
    <StaticPage
      title="Trading Rules & Risk Disclosure"
      subtitle="Live trading expectations and disclosures"
      paragraphs={[
        "This page captures trading rules, risk disclosures, and operating guardrails. It mirrors the risk disclosure content and keeps external links from breaking.",
        "For full risk documentation, review the Risk Disclosure page or contact compliance@bickfordtechnologies.com.",
      ]}
    />
  );
}
