import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { api, ApiError } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setIsLoading(true);
        const current = await api.getMe();
        if (active) {
          setUser(current);
        }
      } catch (error) {
        if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    setUser,
    refresh: async () => {
      try {
        setIsLoading(true);
        const current = await api.getMe();
        setUser(current);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
          setUser(null);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      await api.signOut();
      setUser(null);
    },
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
