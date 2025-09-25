import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { api, ApiError } from '../lib/api';

vi.mock('../lib/api', () => {
  return {
    api: {
      getMe: vi.fn(),
      signOut: vi.fn(),
    },
    ApiError: class extends Error {
      public code: string;

      constructor(message: string, code: string) {
        super(message);
        this.code = code;
      }
    },
  };
});

type WrapperProps = { children: ReactNode };
const wrapper = ({ children }: WrapperProps) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('updates user', async () => {
    (api.getMe as unknown as Mock).mockResolvedValue({ userId: '1', name: 'Alice', email: 'alice@example.com' });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.user?.name).toBe('Alice');
  });

  it('throws when used outside provider', () => {
    let thrown: Error | null = null;
    try {
      renderHook(() => useAuth());
    } catch (error) {
      thrown = error as Error;
    }
    expect(thrown).toBeTruthy();
    expect(thrown?.message).toBe('useAuth must be used inside AuthProvider');
  });

  it('handles unauthorized refresh', async () => {
    (api.getMe as unknown as Mock).mockRejectedValue(new ApiError('Unauthorized', 'UNAUTHORIZED'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.refresh().catch(() => undefined);
    });
    expect(result.current.user).toBeNull();
  });

  it('signs out', async () => {
    const signOutMock = api.signOut as unknown as Mock;
    signOutMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signOut();
    });
    expect(signOutMock).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
