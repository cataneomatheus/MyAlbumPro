import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as googleOAuth from '@react-oauth/google';
import LoginPage from './LoginPage';
import { renderWithProviders } from '../tests/utils';

describe('LoginPage', () => {
  let triggerLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    triggerLogin = vi.fn();
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id.apps.googleusercontent.com');
    vi.spyOn(googleOAuth, 'useGoogleLogin').mockReturnValue(triggerLogin);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('renders Google login button and triggers Google OAuth flow', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    const button = screen.getByRole('button', { name: /Entrar com Google/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(triggerLogin).toHaveBeenCalledTimes(1);
  });
});










