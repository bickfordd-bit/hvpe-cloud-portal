/**
 * Intent Panel Component Tests
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntentPanel } from "../IntentPanel";

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1; // OPEN

  close() {
    this.readyState = 2; // CLOSED
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.EventSource = MockEventSource as any;

describe("IntentPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders in idle state with input and button", () => {
    render(<IntentPanel />);

    expect(screen.getByText("Intent Panel")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell me what you want to do/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyze Intent/i }),
    ).toBeInTheDocument();
  });

  it("disables analyze button when input is empty", () => {
    render(<IntentPanel />);

    const button = screen.getByRole("button", { name: /Analyze Intent/i });
    expect(button).toBeDisabled();
  });

  it("enables analyze button when input has text", () => {
    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    const button = screen.getByRole("button", { name: /Analyze Intent/i });

    fireEvent.change(input, { target: { value: "Test intent" } });

    expect(button).not.toBeDisabled();
  });

  it("calls analyze API and shows proposal", async () => {
    const mockAnalysis = {
      summary: "Got it! I'll help you with that.",
      actions: [
        { step: "Fetch data", why: "To get the latest information" },
        { step: "Process results", why: "To prepare the output" },
      ],
      configFlags: ["TEST_FLAG"],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    const button = screen.getByRole("button", { name: /Analyze Intent/i });

    fireEvent.change(input, { target: { value: "Test intent" } });
    fireEvent.click(button);

    expect(screen.getByText("Analyzing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Got it! I'll help you with that/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Fetch data/)).toBeInTheDocument();
    expect(
      screen.getByText("To get the latest information"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Process results/)).toBeInTheDocument();
    expect(screen.getByText("To prepare the output")).toBeInTheDocument();
    expect(screen.getByText(/Config flags: TEST_FLAG/i)).toBeInTheDocument();
  });

  it("shows error message when analysis fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    const button = screen.getByRole("button", { name: /Analyze Intent/i });

    fireEvent.change(input, { target: { value: "Test intent" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Analysis failed/i)).toBeInTheDocument();
    });
  });

  it("shows execute and cancel buttons in proposed state", async () => {
    const mockAnalysis = {
      summary: "Test summary",
      actions: [{ step: "Test step", why: "Test reason" }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    fireEvent.change(input, { target: { value: "Test intent" } });
    fireEvent.click(screen.getByRole("button", { name: /Analyze Intent/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Execute/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
    });
  });

  it("resets to idle state when cancel is clicked", async () => {
    const mockAnalysis = {
      summary: "Test summary",
      actions: [{ step: "Test step", why: "Test reason" }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    fireEvent.change(input, { target: { value: "Test intent" } });
    fireEvent.click(screen.getByRole("button", { name: /Analyze Intent/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Cancel/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(
      screen.getByPlaceholderText(/Tell me what you want to do/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyze Intent/i }),
    ).toBeInTheDocument();
  });

  it("shows New Intent button after analysis", async () => {
    const mockAnalysis = {
      summary: "Test summary",
      actions: [{ step: "Test step", why: "Test reason" }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysis,
    });

    render(<IntentPanel />);

    const input = screen.getByPlaceholderText(/Tell me what you want to do/i);
    fireEvent.change(input, { target: { value: "Test intent" } });
    fireEvent.click(screen.getByRole("button", { name: /Analyze Intent/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /New Intent/i }),
      ).toBeInTheDocument();
    });
  });
});
