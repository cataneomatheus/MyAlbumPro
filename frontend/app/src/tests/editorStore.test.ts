import { describe, expect, it, beforeEach } from 'vitest';
import { useEditorStore } from '../store/editorStore';
import type { Project } from '../types';

const baseProject: Project = {
  projectId: 'p1',
  title: 'Teste',
  albumSize: '30x30',
  ownerId: 'owner',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [
    {
      pageId: 'page-1',
      index: 0,
      layoutId: 'layout-1',
      slots: [{ slotId: 'slot-a', offsetX: 0, offsetY: 0, scale: 1 }],
    },
  ],
};

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.setState({
      project: null,
      history: [],
      future: [],
      canUndo: false,
      canRedo: false,
      selectedAssetId: null,
      isFullscreen: false,
    });
  });

  it('loads project and tracks history', () => {
    useEditorStore.getState().loadProject(baseProject);
    expect(useEditorStore.getState().project?.title).toBe('Teste');
    expect(useEditorStore.getState().canUndo).toBe(false);
  });

  it('applies project and supports undo/redo', () => {
    useEditorStore.getState().loadProject(baseProject);
    const modified = { ...baseProject, title: 'Outro' };
    useEditorStore.getState().applyProject(modified);
    expect(useEditorStore.getState().project?.title).toBe('Outro');
    expect(useEditorStore.getState().canUndo).toBe(true);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().project?.title).toBe('Teste');
    expect(useEditorStore.getState().canRedo).toBe(true);
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().project?.title).toBe('Outro');
  });

  it('selects asset and places it', () => {
    useEditorStore.getState().loadProject(baseProject);
    useEditorStore.getState().placeAsset('page-1', 'slot-a', 'asset-1');
    const updated = useEditorStore.getState().project;
    expect(updated?.pages[0].slots[0].assetId).toBe('asset-1');
    expect(useEditorStore.getState().canUndo).toBe(true);
  });

  it('changes layout and rebuilds slots', () => {
    useEditorStore.getState().loadProject(baseProject);
    useEditorStore.getState().changePageLayout('page-1', 'layout-2', ['slot-b', 'slot-c']);
    const updated = useEditorStore.getState().project;
    expect(updated?.pages[0].layoutId).toBe('layout-2');
    expect(updated?.pages[0].slots).toHaveLength(2);
  });

  it('change album size with history', () => {
    useEditorStore.getState().loadProject(baseProject);
    useEditorStore.getState().changeAlbumSize('40x40');
    expect(useEditorStore.getState().project?.albumSize).toBe('40x40');
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().project?.albumSize).toBe('30x30');
  });

  it('clears slot and updates transform', () => {
    useEditorStore.getState().loadProject(baseProject);
    useEditorStore.getState().placeAsset('page-1', 'slot-a', 'asset-1');
    useEditorStore.getState().updateSlotTransform('page-1', 'slot-a', {
      offsetX: 0.2,
      offsetY: -0.1,
      scale: 1.2,
    });
    let updated = useEditorStore.getState().project;
    expect(updated?.pages[0].slots[0].offsetX).toBe(0.2);
    useEditorStore.getState().clearSlot('page-1', 'slot-a');
    updated = useEditorStore.getState().project;
    expect(updated?.pages[0].slots[0].assetId).toBeUndefined();
  });
});
