import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PersonaProvider } from "@/components/providers/PersonaProvider";
import HvpeChatDock from "@/components/chat/HvpeChatDock";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "@/lib/envValidator"; // Run environment validation on startup
import { loadLockSpec } from "@/lib/lock/spec";
import { validateLockSpec } from "@/lib/lock/validate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HVPE Cloud Portal | Bickford Technologies",
  description: "High Velocity Profit Engine – Bickford Technologies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce lock spec at boot (fail closed if invalid)
  const { spec } = loadLockSpec();
  validateLockSpec(spec);

  return (
    <html lang="en" className="bg-black text-white">
      <body className={inter.className}>
        <ErrorBoundary>
          <PersonaProvider>
            {children}
            <HvpeChatDock />
          </PersonaProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
