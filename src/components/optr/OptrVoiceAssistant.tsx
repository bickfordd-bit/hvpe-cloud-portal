/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Proprietary - Patent Pending
 * 
 * OPTR Voice Assistant for Mobile
 */

"use client";

import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface OptrVoiceAssistantProps {
  opportunityId: string;
  onResult?: (result: any) => void;
}

export function OptrVoiceAssistant({ opportunityId, onResult }: OptrVoiceAssistantProps) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(" ");
          setTranscript(text);
          handleVoiceCommand(text);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  async function handleVoiceCommand(text: string) {
    try {
      const lowerText = text.toLowerCase();
      
      // Parse common OPTR commands
      if (lowerText.includes("run") || lowerText.includes("start") || lowerText.includes("analyze")) {
        const res = await fetch(`/api/optr/opportunities/${opportunityId}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        
        const responseText = `OPTR analysis started. Coverage is ${data.state.coverage}% with ${data.state.blockers} blockers.`;
        setResponse(responseText);
        speak(responseText);
        
        if (onResult) {
          onResult(data);
        }
      } else if (lowerText.includes("status")) {
        const res = await fetch(`/api/optr/opportunities/${opportunityId}/status`);
        const data = await res.json();
        
        const responseText = `Current status: ${data.coverage}% coverage, ${data.blockers} blockers, ${data.traces} traces.`;
        setResponse(responseText);
        speak(responseText);
        
        if (onResult) {
          onResult(data);
        }
      } else if (lowerText.includes("blockers") || lowerText.includes("issues")) {
        const res = await fetch(`/api/optr/opportunities/${opportunityId}/status`);
        const data = await res.json();
        
        const responseText = data.blockers > 0 
          ? `Found ${data.blockers} blockers. Check the dashboard for details.`
          : "No blockers found. You're good to go!";
        setResponse(responseText);
        speak(responseText);
        
        if (onResult) {
          onResult(data);
        }
      } else {
        const responseText = "Available commands: run analysis, check status, show blockers.";
        setResponse(responseText);
        speak(responseText);
      }
    } catch (error: any) {
      const errorText = "Sorry, I couldn't process that command. Please try again.";
      setResponse(errorText);
      speak(errorText);
      console.error("Voice command error:", error);
    }
  }

  function speak(text: string) {
    if (!audioEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = "en-US";
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    synthRef.current.speak(utterance);
  }

  function startListening() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    setTranscript("");
    setResponse("");
    setListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }

  function toggleAudio() {
    setAudioEnabled(!audioEnabled);
    if (synthRef.current && !audioEnabled) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Transcript/Response Display */}
      {(transcript || response) && (
        <div className="max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-lg p-4 shadow-2xl">
          {transcript && (
            <div className="mb-2">
              <div className="text-xs font-medium text-neutral-400 mb-1">You said:</div>
              <div className="text-sm text-white">{transcript}</div>
            </div>
          )}
          {response && (
            <div>
              <div className="text-xs font-medium text-neutral-400 mb-1">OPTR:</div>
              <div className="text-sm text-emerald-400">{response}</div>
            </div>
          )}
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`rounded-full p-3 shadow-lg transition-all ${
            audioEnabled
              ? "bg-neutral-800 text-white hover:bg-neutral-700"
              : "bg-neutral-900 text-neutral-500 hover:bg-neutral-800"
          }`}
          title={audioEnabled ? "Mute audio" : "Unmute audio"}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Microphone Button */}
        <button
          onClick={listening ? stopListening : startListening}
          className={`rounded-full p-4 shadow-2xl transition-all ${
            listening
              ? "bg-red-600 hover:bg-red-500 animate-pulse"
              : speaking
              ? "bg-emerald-600 hover:bg-emerald-500 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
          title={listening ? "Stop listening" : "Start voice command"}
        >
          {listening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Status Indicator */}
      {listening && (
        <div className="text-xs text-neutral-400 bg-neutral-900/90 backdrop-blur px-3 py-1 rounded-full">
          Listening...
        </div>
      )}
      {speaking && (
        <div className="text-xs text-emerald-400 bg-neutral-900/90 backdrop-blur px-3 py-1 rounded-full">
          Speaking...
        </div>
      )}
    </div>
  );
}
