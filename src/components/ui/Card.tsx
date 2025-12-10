import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border shadow-xl p-4 md:p-5 bg-neutral-950/90 backdrop-blur-sm animate-[fadeIn_0.25s_ease]",
        "border-neutral-800",
        className
      )}
      style={{
        boxShadow: "0 0 40px rgba(0,0,0,0.65)",
      }}
    >
      {children}
    </section>
  );
}
