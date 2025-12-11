import { StaticPage } from "@/components/pages/StaticPage";

export default function PrivacyPolicyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle="How Bickford Technologies handles data"
      paragraphs={[
        "We collect only the data needed to operate the HVPE portal and fulfill licensing obligations. This placeholder prevents 404s while the detailed policy is finalized.",
        "For privacy requests, contact privacy@bickfordtechnologies.com.",
      ]}
    />
  );
}
