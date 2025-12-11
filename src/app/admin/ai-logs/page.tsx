import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtDate(date: Date) {
  return date.toISOString().replace("T", " ").replace("Z", "");
}

export default async function AiLogsPage() {
  const logs = await prisma.aiUsageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="p-6 space-y-4 text-sm text-neutral-200">
      <div>
        <h1 className="text-xl font-semibold">AI Usage Logs (latest 50)</h1>
        <p className="text-neutral-400 text-xs">
          mode / model / tokens / latency / success — from AiUsageLog
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-xs">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Tenant</th>
              <th className="px-3 py-2 text-left">Mode</th>
              <th className="px-3 py-2 text-left">Model</th>
              <th className="px-3 py-2 text-right">Tokens</th>
              <th className="px-3 py-2 text-right">Latency ms</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-neutral-800">
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtDate(log.createdAt)}
                </td>
                <td className="px-3 py-2">{log.tenantId || "-"}</td>
                <td className="px-3 py-2">{log.mode || "-"}</td>
                <td className="px-3 py-2">{log.model || "-"}</td>
                <td className="px-3 py-2 text-right">
                  {log.totalTokens ?? "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  {log.latencyMs ?? "-"}
                </td>
                <td className="px-3 py-2">
                  {log.success ? (
                    <span className="text-emerald-400">OK</span>
                  ) : (
                    <span className="text-red-400">ERR</span>
                  )}
                </td>
                <td className="px-3 py-2 text-red-300">
                  {log.errorMessage || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
