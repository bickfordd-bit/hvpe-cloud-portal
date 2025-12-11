import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DoDLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F6FB] to-white text-[#0A1F44]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
