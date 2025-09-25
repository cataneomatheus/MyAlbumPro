import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ThumbnailStrip from './ThumbnailStrip';
import { useEditorStore } from '../store/editorStore';

const assets = [
  {
    assetId: 'asset-1',
    fileName: 'foto.jpg',
    mimeType: 'image/jpeg',
    s3Key: 'foto',
    thumbKey: 'foto-thumb',
    width: 800,
    height: 600,
    bytes: 1024,
    thumbnailUrl: 'https://picsum.photos/seed/asset-1/120/120',
  },
];

describe('ThumbnailStrip', () => {
  it('updates selection on click', () => {
    render(<ThumbnailStrip assets={assets} />);
    const image = screen.getByAltText('foto.jpg');
    fireEvent.click(image);
    expect(useEditorStore.getState().selectedAssetId).toBe('asset-1');
  });
});
