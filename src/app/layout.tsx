import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PersonaProvider } from "@/components/providers/PersonaProvider";
import HvpeChatDock from "@/components/chat/HvpeChatDock";

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
  return (
    <html lang="en" className="bg-black text-white">
      <body className={inter.className}>
        <PersonaProvider>
          {children}
          <HvpeChatDock />
        </PersonaProvider>
      </body>
    </html>
  );
}
