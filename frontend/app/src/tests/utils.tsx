import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../context/AuthContext';
import type { AuthSession } from '../types';

const testGoogleClientId = 'test-client-id.apps.googleusercontent.com';

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    session,
  }: {
    route?: string;
    session?: AuthSession;
  } = {},
) {
  window.history.pushState({}, 'Test page', route);

  if (session) {
    window.localStorage.setItem('map.auth', JSON.stringify(session));
  } else {
    window.localStorage.removeItem('map.auth');
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      <GoogleOAuthProvider clientId={testGoogleClientId}>
        <AuthProvider>{ui}</AuthProvider>
      </GoogleOAuthProvider>
    </MemoryRouter>,
  );
}










