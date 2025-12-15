import "./globals.css";
import type { Metadata } from "next";
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
  return (
    <html lang="en" className="bg-black text-white">
      <body className="font-sans antialiased">
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
