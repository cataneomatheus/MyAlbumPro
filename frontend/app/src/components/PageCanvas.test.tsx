import { fireEvent, render, screen } from '@testing-library/react';
import PageCanvas from './PageCanvas';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '../store/editorStore';

const layout = {
  id: 'layout-1',
  name: 'Cheio',
  slots: [{ slotId: 'slot-a', x: 0, y: 0, width: 1, height: 1 }],
};

const page = {
  pageId: 'page-1',
  index: 0,
  layoutId: 'layout-1',
  slots: [{ slotId: 'slot-a', assetId: 'asset-1', offsetX: 0, offsetY: 0, scale: 1 }],
};

const assets = {
  'asset-1': {
    assetId: 'asset-1',
    fileName: 'foto.jpg',
    mimeType: 'image/jpeg',
    s3Key: 'foto',
    thumbKey: 'thumb',
    width: 800,
    height: 600,
    bytes: 1024,
    thumbnailUrl: 'https://picsum.photos/seed/asset-1/120/120',
  },
};

describe('PageCanvas', () => {
  beforeEach(() => {
    useEditorStore.setState({ project: {
      projectId: 'proj',
      title: 'Proj',
      albumSize: '30x30',
      ownerId: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [page],
    }, selectedAssetId: null, isFullscreen: false });
  });

  it('clears a slot on double click', () => {
    render(<PageCanvas layout={layout} page={page} assets={assets} />);
    const slot = screen.getByRole('img', { name: /foto\.jpg/i });
    fireEvent.doubleClick(slot);
    const updated = useEditorStore.getState().project;
    expect(updated?.pages[0].slots[0].assetId).toBeUndefined();
  });
});

