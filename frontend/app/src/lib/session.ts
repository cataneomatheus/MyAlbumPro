import type { AuthSession, AuthUser } from '../types';

const STORAGE_KEY = 'map.auth';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

let cached: AuthSession | null = null;

function parseSession(snapshot: string | null): AuthSession | null {
  if (!snapshot) {
    return null;
  }

  try {
    const raw = JSON.parse(snapshot) as Partial<AuthSession> & {
      user?: Partial<AuthUser>;
    };

    if (!raw || typeof raw.accessToken !== 'string' || typeof raw.expiresAt !== 'string' || !raw.user) {
      return null;
    }

    const user = raw.user;
    if (!user || typeof user.userId !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') {
      return null;
    }

    return {
      accessToken: raw.accessToken,
      expiresAt: raw.expiresAt,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        pictureUrl: typeof user.pictureUrl === 'string' ? user.pictureUrl : undefined,
      },
    };
  } catch {
    return null;
  }
}

function readFromStorage(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }
  const session = parseSession(window.localStorage.getItem(STORAGE_KEY));
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return session;
}

export function getSession(): AuthSession | null {
  if (cached !== null) {
    return cached;
  }
  cached = readFromStorage();
  return cached;
}

export function setSession(session: AuthSession | null): void {
  cached = session;
  if (!isBrowser()) {
    return;
  }
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearSession(): void {
  setSession(null);
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function updateSessionUser(user: AuthUser): void {
  const current = getSession();
  if (!current) {
    return;
  }
  setSession({ ...current, user });
}

export function resetSessionState(): void {
  cached = null;
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}










