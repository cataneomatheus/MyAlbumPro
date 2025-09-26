import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as googleOAuth from "@react-oauth/google";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "../tests/utils";
import { api } from "../lib/api";

describe("LoginPage", () => {
  let triggerLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    triggerLogin = vi.fn();
    vi.spyOn(googleOAuth, "useGoogleLogin").mockReturnValue(triggerLogin);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("renders Google login button and triggers Google OAuth flow", () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com");
    renderWithProviders(<LoginPage />, { route: "/login" });
    const button = screen.getByRole("button", { name: /Entrar com Google/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(triggerLogin).toHaveBeenCalledTimes(1);
  });

  it("permite autenticar em modo desenvolvimento quando Google nao esta configurado", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "");
    const devSignIn = vi.spyOn(api, "devSignIn").mockResolvedValue({
      userId: "dev-user-id",
      email: "dev@local.test",
      name: "Desenvolvedor",
      pictureUrl: "",
    });

    renderWithProviders(<LoginPage />, { route: "/login" });

    const emailInput = screen.getByLabelText(/Email/i);
    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(emailInput, { target: { value: "dev@local.test" } });
    fireEvent.change(nameInput, { target: { value: "Dev User" } });

    const devButton = screen.getByRole("button", { name: /Entrar em modo desenvolvimento/i });
    fireEvent.click(devButton);

    await waitFor(() => {
      expect(devSignIn).toHaveBeenCalledWith({ email: "dev@local.test", name: "Dev User" });
    });

    devSignIn.mockRestore();
  });
});
