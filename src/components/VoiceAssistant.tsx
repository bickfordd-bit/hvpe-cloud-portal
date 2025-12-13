"use client";

import React, { useEffect, useState, useRef } from "react";

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  async function handleSend(apply = true) {
    if (!transcript) return setStatus("No transcript");
    setStatus("Sending to AI...");
    try {
      const res = await fetch("/api/ai/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript, apply })
      });
      const j = await res.json();
      if (j.error) setStatus(String(j.error));
      else setStatus(`OK → branch: ${j.branch || "(preview)"}`);
    } catch (err: any) {
      setStatus(String(err?.message || err));
    }
  }

  function start() {
    const r = recognitionRef.current;
    if (!r) return setStatus("SpeechRecognition not supported");
    setTranscript("");
    setStatus("Listening...");
    setListening(true);
    r.start();
  }

  function stop() {
    const r = recognitionRef.current;
    if (!r) return;
    r.stop();
    setListening(false);
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-neutral-900/80 backdrop-blur-md rounded-lg p-3 w-72">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded ${listening ? "bg-rose-600" : "bg-green-600"}`}
            onClick={() => (listening ? stop() : start())}
          >
            {listening ? "Stop" : "Speak"}
          </button>
          <button
            className="px-2 py-1 rounded bg-blue-600"
            onClick={() => handleSend(true)}
          >
            Apply
          </button>
          <button
            className="px-2 py-1 rounded bg-slate-600"
            onClick={() => handleSend(false)}
          >
            Preview
          </button>
        </div>
        <div className="mt-2 text-xs text-neutral-300">
          <div className="h-12 overflow-auto whitespace-pre-wrap">{transcript || <em>Say a command or paste text</em>}</div>
          <div className="mt-2 text-[11px] text-neutral-400">{status}</div>
        </div>
      </div>
    </div>
  );
}
