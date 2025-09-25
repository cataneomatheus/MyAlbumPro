import { fireEvent, screen, waitFor } from '@testing-library/react';
import EditorPage from './EditorPage';
import { useEditorStore } from '../store/editorStore';
import { renderWithProviders } from '../tests/utils';
import { describe, expect, it } from 'vitest';

describe('EditorPage', () => {
  it('loads project and allows autopreencher', async () => {
    renderWithProviders(<EditorPage />, { route: '/editor/proj-1' });
    await waitFor(() => screen.getByText(/Layouts disponíveis/i));
    expect(screen.getByText(/Layouts disponíveis/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Autopreencher/i });
    fireEvent.click(button);
    await waitFor(() => expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument());
  });
  it('initializes new project from layout', async () => {
    renderWithProviders(<EditorPage />, { route: '/editor/new' });
    await waitFor(() => expect(useEditorStore.getState().project).not.toBeNull());
  });
});




