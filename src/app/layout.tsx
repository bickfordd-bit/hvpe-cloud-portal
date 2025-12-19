import "./globals.css";
import type { Metadata } from "next";
import { bickfordFont } from "./fonts";
import { PersonaProvider } from "@/components/providers/PersonaProvider";
import HvpeChatDock from "@/components/chat/HvpeChatDock";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "@/lib/envValidator"; // Run environment validation on startup

export const metadata: Metadata = {
  title: "HVPE Cloud Portal | Bickford Technologies",
  description: "High Velocity Profit Engine – Bickford Technologies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lock spec validation moved to API routes only (Node.js env)
  // Native app doesn't need filesystem-based lock validation

  return (
    <html lang="en" className={`bg-black text-white ${bickfordFont.variable}`}>
      <body className="font-bickford">
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
