import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { api, ApiError } from '../lib/api';
import { getSession, setSession, clearSession } from '../lib/session';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => getSession()?.user ?? null);
  const [isLoading, setIsLoading] = useState(true);

  const syncUser = useCallback((value: AuthUser | null) => {
    setUserState(value);
    if (!value) {
      clearSession();
      return;
    }

    const session = getSession();
    if (session) {
      setSession({ ...session, user: value });
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const current = await api.getMe();
      const session = getSession();
      if (session) {
        setSession({ ...session, user: current });
      }
      setUserState(current);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        clearSession();
        setUserState(null);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setIsLoading(false);
      return;
    }

    setUserState(session.user);
    refresh().catch((error) => {
      if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
        return;
      }
      console.error('Falha ao restaurar Sessao', error);
    });
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await api.signOut();
    } finally {
      clearSession();
      setUserState(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    setUser: syncUser,
    refresh,
    signOut,
  }), [user, isLoading, syncUser, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}










