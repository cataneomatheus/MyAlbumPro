import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const session = {
  accessToken: 'test-token',
  expiresAt: new Date().toISOString(),
  user: {
    userId: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    pictureUrl: '',
  },
};

describe('App', () => {
  beforeEach(() => {
    window.localStorage.setItem('map.auth', JSON.stringify(session));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it.skip('renders projects page by default', async () => {
    // TODO: rebuild this integration snapshot with a MemoryRouter wrapper if needed.
    render(
      <GoogleOAuthProvider clientId="test-client-id.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>,
    );
    await waitFor(() => screen.getByText(/Meus projetos/i));
    expect(screen.getByText(/Meus projetos/i)).toBeInTheDocument();
  });
});










