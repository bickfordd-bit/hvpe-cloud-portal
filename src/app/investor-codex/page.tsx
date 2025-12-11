import { StaticPage } from "@/components/pages/StaticPage";

export default function InvestorCodexPage() {
  return (
    <StaticPage
      title="Investor Codex"
      subtitle="Disclosures and investor documentation"
      paragraphs={[
        "This page exists to serve investor-focused materials and avoid dead links. Investor presentations, disclosures, and performance notes will be maintained here.",
        "Contact investors@bickfordtechnologies.com for the latest deck or data room access.",
      ]}
    />
  );
}
