import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ViewerPage from './ViewerPage';
import { renderWithProviders } from '../tests/utils';

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

describe('ViewerPage', () => {
  it('renders viewer', async () => {
    renderWithProviders(<ViewerPage />, { route: '/viewer/proj-1', session });
    await waitFor(() => screen.getByText(/Visualizacao/i));
    expect(screen.getByText(/Visualizacao/i)).toBeInTheDocument();
  });
});










