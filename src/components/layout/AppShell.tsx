"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import VoiceAssistant from "@/components/VoiceAssistant";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-neutral-950 text-neutral-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-black via-neutral-950 to-black p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4">{children}</div>
        </main>
        <VoiceAssistant />
        <StatusBar />
      </div>
    </div>
  );
}
