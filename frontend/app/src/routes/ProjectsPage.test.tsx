import { screen, waitFor } from '@testing-library/react';
import ProjectsPage from './ProjectsPage';
import { renderWithProviders } from '../tests/utils';
import { describe, expect, it } from 'vitest';

describe('ProjectsPage', () => {
  it('renders project cards', async () => {
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    await waitFor(() => screen.getByText('Viagem'));
    expect(screen.getByText('Viagem')).toBeInTheDocument();
    expect(screen.getByText(/Novo projeto/i)).toBeInTheDocument();
  });
});

