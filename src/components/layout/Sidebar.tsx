"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePersona } from "@/components/providers/PersonaProvider";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  key: string;
  href?: string;
  external?: boolean;
};

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: "Core",
    items: [{ label: "Home", key: "home", href: "/" }],
  },
  {
    section: "Trading Engine",
    items: [
      { label: "Live Dashboard", key: "engine-dashboard", href: "/trading" },
      { label: "Trade Packets", key: "trade-packets", href: "/packets" },
      { label: "Arbitrator", key: "arbitrator", href: "/arbitrator" },
    ],
  },
  {
    section: "Financial Vaults",
    items: [
      { label: "Debt Vault", key: "vault-debt" },
      { label: "Education Vault", key: "vault-edu" },
      { label: "Income Vault", key: "vault-income" },
    ],
  },
  {
    section: "Intelligence Systems",
    items: [
      { label: "Supra-Intelligence", key: "supra-intel" },
      { label: "Brain Mode", key: "brain-mode" },
      { label: "MJ Mode", key: "mj-mode" },
      { label: "Manifest Mode", key: "manifest-mode" },
      { label: "Compounding Layer", key: "compounding-layer" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Configurations", key: "config" },
      { label: "Licensing & Billing", key: "license", href: "/license" },
      { label: "Investor View", key: "investor", href: "/investor" },
      {
        label: "DoD Portal",
        key: "dod-portal",
        href: "https://hvpe-dod-portal-new.vercel.app",
        external: true
      }
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { persona } = usePersona();
  const pathname = usePathname() ?? "/";

  return (
    <aside
      className={cn(
        "h-full border-r border-neutral-800 bg-gradient-to-b from-black via-neutral-950 to-black transition-all duration-200",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <button
          className="hidden md:flex items-center justify-end px-3 py-2 text-[10px] text-neutral-500 hover:text-neutral-200"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "»" : "«"}
        </button>

        <nav className="flex-1 overflow-auto px-2 pb-4 space-y-4">
          {navSections.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-neutral-500">
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = item.href
                    ? pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href))
                    : persona === "trader" && item.key === "engine-dashboard"
                    ? true
                    : item.key === "home";

                  const itemClass = cn(
                    "w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-left transition",
                    active
                      ? "bg-blue-600/20 text-blue-100 border border-blue-500/60 shadow-[0_0_18px_rgba(37,99,235,0.45)]"
                      : "text-neutral-300 hover:bg-neutral-900/80 border border-transparent",
                  );

                  const itemContent = (
                    <>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          active ? "bg-blue-400" : "bg-neutral-600",
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  );

                  if (item.href) {
                    if (item.external) {
                      return (
                        <a
                          key={item.key}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={itemClass}
                        >
                          {itemContent}
                        </a>
                      );
                    }
                    return (
                      <Link key={item.key} href={item.href} className={itemClass}>
                        {itemContent}
                      </Link>
                    );
                  }

                  return (
                    <button key={item.key} type="button" className={itemClass}>
                      {itemContent}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Persona hint / footer */}
        <div className="px-3 pb-3 border-t border-neutral-800 pt-3 text-[10px] text-neutral-500">
          {!collapsed && (
            <>
              <div>
                Persona:{" "}
                <span className="text-neutral-200 font-medium capitalize">
                  {persona}
                </span>
              </div>
              <div className="mt-1">
                UI layout is optimized for this mode in real time.
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
