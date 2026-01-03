/**
 * Chat Input Component
 * Intent submission input for filing UI
 */

"use client";

import { useState } from "react";

export function ChatInput({
  onSubmit,
}: {
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-4 border-t border-gray-800"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what you want to do..."
        disabled={submitting}
        className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
      />
    </form>
  );
}
