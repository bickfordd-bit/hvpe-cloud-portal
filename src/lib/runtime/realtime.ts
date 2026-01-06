/**
 * Real-time Event System
 * In-memory event emitter for broadcasting canon events to UI
 */

import type { CanonEvent } from "@/types/filing";

type Listener = (event: CanonEvent) => void;
const listeners: Listener[] = [];

/**
 * Emit a canon event to all subscribers
 */
export function emitCanonEvent(event: CanonEvent): void {
  listeners.forEach((fn) => fn(event));
}

/**
 * Subscribe to canon events
 * Returns unsubscribe function
 */
export function subscribeCanonEvents(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}
