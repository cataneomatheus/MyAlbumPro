import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

// Render without providers because App already includes BrowserRouter/AuthProvider

describe('App', () => {
  it('renders projects page by default', async () => {
    render(<App />);
    await waitFor(() => screen.getByText(/Meus Projetos/i));
    expect(screen.getByText(/Meus Projetos/i)).toBeInTheDocument();
  });
});
