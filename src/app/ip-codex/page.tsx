import { StaticPage } from "@/components/pages/StaticPage";

export default function IPCodexPage() {
  return (
    <StaticPage
      title="IP Codex"
      subtitle="HVPE intellectual property registry"
      paragraphs={[
        "This route anchors references to the IP Codex and prevents 404s. Detailed IP documentation and registration records will be published here.",
        "For formal requests, email legal@bickfordtechnologies.com.",
      ]}
    />
  );
}
