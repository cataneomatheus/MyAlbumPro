import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FullScreenViewer from './FullScreenViewer';
import type { Asset, Layout, Project } from '../types';

const project: Project = {
  projectId: 'proj-1',
  title: 'Viagem',
  albumSize: '30x30',
  ownerId: 'owner',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [
    {
      pageId: 'page-1',
      index: 0,
      layoutId: 'layout-1',
      slots: [{ slotId: 'slot-a', assetId: 'asset-1', offsetX: 0, offsetY: 0, scale: 1 }],
    },
  ],
};

const layouts: Layout[] = [
  {
    id: 'layout-1',
    name: 'Cheio',
    slots: [{ slotId: 'slot-a', x: 0, y: 0, width: 1, height: 1 }],
  },
];

const assets: Asset[] = [
  {
    assetId: 'asset-1',
    fileName: 'foto.jpg',
    mimeType: 'image/jpeg',
    s3Key: 'foto',
    thumbKey: 'thumb',
    width: 1000,
    height: 800,
    bytes: 1024,
    thumbnailUrl: 'https://picsum.photos/seed/asset-1/100/100',
  },
];

describe('FullScreenViewer', () => {
  it('renders and navigates pages', () => {
    const onClose = vi.fn();
    render(
      <FullScreenViewer project={project} layouts={layouts} assets={assets} onClose={onClose} />,
    );
    expect(screen.getByText(/Visualização/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));
    expect(onClose).toHaveBeenCalled();
  });
  it('renders fallback when layout missing', () => {
    render(<FullScreenViewer project={project} layouts={[]} assets={assets} onClose={() => {}} />);
    expect(screen.getByText(/Layout não encontrado/i)).toBeInTheDocument();
  });
});

