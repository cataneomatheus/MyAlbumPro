import { screen, waitFor } from '@testing-library/react';
import ProjectsPage from './ProjectsPage';
import { renderWithProviders } from '../tests/utils';
import { describe, expect, it } from 'vitest';

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

describe('ProjectsPage', () => {
  it('renders project cards', async () => {
    renderWithProviders(<ProjectsPage />, { route: '/projects', session });
    await waitFor(() => screen.getByText('Viagem'));
    expect(screen.getByText('Viagem')).toBeInTheDocument();
    expect(screen.getByText(/Novo projeto/i)).toBeInTheDocument();
  });
});










