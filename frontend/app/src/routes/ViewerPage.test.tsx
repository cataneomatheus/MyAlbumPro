import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ViewerPage from './ViewerPage';
import { renderWithProviders } from '../tests/utils';

describe('ViewerPage', () => {
  it('renders viewer', async () => {
    renderWithProviders(<ViewerPage />, { route: '/viewer/proj-1' });
    await waitFor(() => screen.getByText(/Visualização/i));
    expect(screen.getByText(/Visualização/i)).toBeInTheDocument();
  });
});
