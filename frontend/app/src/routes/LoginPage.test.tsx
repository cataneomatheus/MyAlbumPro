import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { renderWithProviders } from '../tests/utils';

describe('LoginPage', () => {
  const originalLocation = window.location;
  let setHref: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setHref = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        origin: 'http://localhost',
        get href() {
          return '';
        },
        set href(value: string) {
          setHref(value);
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders Google login button and triggers redirect', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    const button = screen.getByRole('button', { name: /Entrar com Google/i });
    fireEvent.click(button);
    expect(setHref).toHaveBeenCalled();
  });
});
