import type { ReactNode } from "react";

export function OptrShell(props: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-400">OPTR</div>
            <h1 className="mt-1 text-2xl font-semibold">{props.title}</h1>
            {props.subtitle && (
              <div className="mt-1 text-sm text-neutral-400">{props.subtitle}</div>
            )}
          </div>
          {props.right && <div className="flex items-center gap-2">{props.right}</div>}
        </div>

        <div className="mt-6">{props.children}</div>
      </div>
    </div>
  );
}
