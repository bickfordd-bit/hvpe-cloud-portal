/**
 * BickfordChat Component Tests
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BickfordChat } from "../BickfordChat";

// Mock fetch
global.fetch = jest.fn();

describe("BickfordChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders chat interface with input and button", () => {
    render(<BickfordChat />);

    expect(screen.getByText("Bickford Chat")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask Bickford about your portfolio/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send/i })).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<BickfordChat />);

    const button = screen.getByRole("button", { name: /Send/i });
    expect(button).toBeDisabled();
  });

  it("enables send button when input has text", () => {
    render(<BickfordChat />);

    const input = screen.getByPlaceholderText(
      /Ask Bickford about your portfolio/i,
    );
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, {
      target: { value: "What should I invest in?" },
    });

    expect(button).not.toBeDisabled();
  });

  it("displays user message after sending", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Test response from Bickford" }),
    });

    render(<BickfordChat />);

    const input = screen.getByPlaceholderText(
      /Ask Bickford about your portfolio/i,
    );
    const button = screen.getByRole("button", { name: /Send/i });

    fireEvent.change(input, {
      target: { value: "What should I invest in?" },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("What should I invest in?")).toBeInTheDocument();
    });
  });

  it("sends message on Enter key press", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: "Test response" }),
    });

    render(<BickfordChat />);

    const input = screen.getByPlaceholderText(
      /Ask Bickford about your portfolio/i,
    );

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });
  });
});
