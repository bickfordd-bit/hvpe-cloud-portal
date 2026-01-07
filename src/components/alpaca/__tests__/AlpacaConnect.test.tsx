/**
 * AlpacaConnect Component Tests
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AlpacaConnect } from "../AlpacaConnect";

// Mock fetch
global.fetch = jest.fn();

describe("AlpacaConnect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the connect form with inputs and button", () => {
    render(<AlpacaConnect />);

    expect(
      screen.getByRole("heading", { name: "Connect Alpaca" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PKXXXXXXXX")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter secret key")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Connect Alpaca/i }),
    ).toBeInTheDocument();
  });

  it("disables connect button when inputs are empty", () => {
    render(<AlpacaConnect />);

    const button = screen.getByRole("button", { name: /Connect Alpaca/i });
    expect(button).toBeDisabled();
  });

  it("enables connect button when both inputs have values", () => {
    render(<AlpacaConnect />);

    const apiKeyInput = screen.getByPlaceholderText("PKXXXXXXXX");
    const apiSecretInput = screen.getByPlaceholderText("Enter secret key");
    const button = screen.getByRole("button", { name: /Connect Alpaca/i });

    fireEvent.change(apiKeyInput, { target: { value: "PKTEST123" } });
    fireEvent.change(apiSecretInput, { target: { value: "secret123" } });

    expect(button).not.toBeDisabled();
  });

  it("shows success message on successful connection", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<AlpacaConnect />);

    const apiKeyInput = screen.getByPlaceholderText("PKXXXXXXXX");
    const apiSecretInput = screen.getByPlaceholderText("Enter secret key");
    const button = screen.getByRole("button", { name: /Connect Alpaca/i });

    fireEvent.change(apiKeyInput, { target: { value: "PKTEST123" } });
    fireEvent.change(apiSecretInput, { target: { value: "secret123" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Alpaca API connected/i)).toBeInTheDocument();
    });
  });

  it("displays paper trading notice", () => {
    render(<AlpacaConnect />);

    expect(screen.getByText(/Paper trading by default/i)).toBeInTheDocument();
  });
});
