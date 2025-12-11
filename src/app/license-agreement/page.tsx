import { StaticPage } from "@/components/pages/StaticPage";

export default function LicenseAgreementPage() {
  return (
    <StaticPage
      title="License Agreement"
      subtitle="HVPE software license"
      paragraphs={[
        "This page summarizes the HVPE license agreement and prevents 404s from footer links. Detailed terms are also available on the Terms page.",
        "For signed copies or questions, email legal@bickfordtechnologies.com.",
      ]}
    />
  );
}
