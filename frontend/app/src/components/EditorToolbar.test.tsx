import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorToolbar } from './EditorToolbar';

const albumSizes = [
  { code: '30x30', widthCm: 30, heightCm: 30 },
  { code: '40x40', widthCm: 40, heightCm: 40 },
];

describe('EditorToolbar', () => {
  it('invokes callbacks', () => {
    const onSize = vi.fn();
    const onSave = vi.fn();
    const onAuto = vi.fn();
    const onPreview = vi.fn();
    const onUndo = vi.fn();
    const onRedo = vi.fn();

    render(
      <EditorToolbar
        albumSizes={albumSizes}
        selectedSize="30x30"
        canUndo
        canRedo={false}
        onAlbumSizeChange={onSize}
        onSave={onSave}
        onAutoFill={onAuto}
        onPreview={onPreview}
        onUndo={onUndo}
        onRedo={onRedo}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('30x30'), { target: { value: '40x40' } });
    fireEvent.click(screen.getByRole('button', { name: /Desfazer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Refazer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Autopreencher/i }));
    fireEvent.click(screen.getByRole('button', { name: /Pré-visualizar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    expect(onSize).toHaveBeenCalledWith('40x40');
    expect(onUndo).toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    expect(onAuto).toHaveBeenCalled();
    expect(onPreview).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });
});
