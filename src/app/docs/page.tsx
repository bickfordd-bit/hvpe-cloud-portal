import { StaticPage } from "@/components/pages/StaticPage";

export default function DocsPage() {
  return (
    <StaticPage
      title="Documentation"
      subtitle="API, packets, and operator guides"
      paragraphs={[
        "Full documentation is being consolidated here. For now, this route remains live to avoid broken links while we migrate existing docs.",
        "Reach out to support@bickfordtechnologies.com for the latest PDFs and runbooks.",
      ]}
    />
  );
}
