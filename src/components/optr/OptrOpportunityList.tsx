import Link from "next/link";
import type { Opportunity } from "@/lib/optr/types";

export function OptrOpportunityList({ items }: { items: Opportunity[] }) {
  return (
    <div className="divide-y divide-neutral-800">
      {items.map((x) => (
        <Link
          key={x.id}
          href={`/optr/${encodeURIComponent(x.id)}`}
          className="block py-4 hover:bg-neutral-950/60"
        >
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-neutral-400">{x.agency}</div>
              <div className="text-base font-medium">{x.title}</div>
              <div className="mt-1 text-xs text-neutral-500">{x.id}</div>
            </div>
            <div className="mt-2 text-sm text-neutral-300 md:mt-0">
              Deadline:{" "}
              <span className="text-neutral-100">
                {safeDate(x.deadline_iso) ?? x.deadline_iso}
              </span>
            </div>
          </div>
        </Link>
      ))}
      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-neutral-400">No opportunities.</div>
      ) : null}
    </div>
  );
}

function safeDate(iso: string): string | null {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
}
