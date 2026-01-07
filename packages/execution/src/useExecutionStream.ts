import { useEffect, useState } from "react";
import { ExecutionEvent } from "./ExecutionEvent";
import { ExecutionState } from "./ExecutionState";
import { isTerminalState } from "./ExecutionInvariants";

export function useExecutionStream(executionId: string) {
  const [currentState, setCurrentState] = useState<ExecutionState | null>(null);
  const [history, setHistory] = useState<ExecutionEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<ExecutionEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/executions/${executionId}/stream`,
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ExecutionEvent;

        if ((data as any).type === "connected") {
          return;
        }

        setCurrentState(data.currentState);
        setLatestEvent(data);
        setHistory((prev) => [...prev, data]);
      } catch (err) {
        setError(err as Error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError(new Error("SSE connection failed"));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [executionId]);

  return {
    currentState,
    latestEvent,
    history,
    isConnected,
    error,
    isTerminal: currentState ? isTerminalState(currentState) : false,
  };
}
