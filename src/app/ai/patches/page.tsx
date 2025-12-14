import { prisma } from "@/lib/prisma";
import ApprovePatchButton from "@/components/AI/ApprovePatchButton";

export const dynamic = 'force-dynamic';

export default async function Page() {
  let patches: any[] = [];
  
  try {
    patches = await prisma.aIPatchLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } catch (error) {
    console.warn('Database not configured:', error);
  }

  if (patches.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">AI-generated patches</h1>
        <p className="text-gray-600">No patches found. Database may not be configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI-generated patches</h1>
      <div className="space-y-2">
        {patches.map((p) => (
          <div key={p.id} className="p-3 bg-neutral-900 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-neutral-300">{p.instruction}</div>
                <div className="text-xs text-neutral-500">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="text-xs text-neutral-400">{p.approvedAt ? `Approved → ${new Date(p.approvedAt).toLocaleString()}` : "Not approved"}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-neutral-400">{p.applied ? `Applied → ${p.branch}` : "Pending"}</div>
                {!p.applied && <ApprovePatchButton id={p.id} />}
              </div>
            </div>
            <pre className="mt-2 text-xs overflow-auto max-h-72 text-neutral-200 bg-black p-2 rounded">{p.patch}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
