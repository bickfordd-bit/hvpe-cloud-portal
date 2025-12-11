import { StaticPage } from "@/components/pages/StaticPage";

export default function CompanyPage() {
  return (
    <StaticPage
      title="Company"
      subtitle="Bickford Technologies"
      paragraphs={[
        "Bickford Technologies builds the High Velocity Profit Engine (HVPE) and supporting intelligence systems. This route captures company information and avoids 404s from public navigation.",
        "For press or partnerships, email hello@bickfordtechnologies.com.",
      ]}
    />
  );
}
