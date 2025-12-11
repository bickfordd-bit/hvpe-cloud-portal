export function StaticPage({
  title,
  subtitle,
  paragraphs,
}: {
  title: string;
  subtitle?: string;
  paragraphs: string[];
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        {paragraphs.map((text, idx) => (
          <p key={idx} className="text-gray-300 leading-relaxed">
            {text}
          </p>
        ))}
      </div>
    </main>
  );
}
