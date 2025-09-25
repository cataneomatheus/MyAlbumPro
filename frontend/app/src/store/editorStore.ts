import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PageSlot, Project } from '../types';

const MAX_HISTORY = 20;

const cloneProject = (project: Project) => structuredClone(project);

type EditorHistoryState = {
  project: Project | null;
  history: Project[];
  future: Project[];
  canUndo: boolean;
  canRedo: boolean;
};

export type EditorState = EditorHistoryState & {
  selectedAssetId: string | null;
  isFullscreen: boolean;
  loadProject: (project: Project) => void;
  applyProject: (project: Project) => void;
  selectAsset: (assetId: string | null) => void;
  placeAsset: (pageId: string, slotId: string, assetId: string) => void;
  clearSlot: (pageId: string, slotId: string) => void;
  changeAlbumSize: (albumSize: string) => void;
  changePageLayout: (pageId: string, layoutId: string, slotIds: string[]) => void;
  toggleFullscreen: () => void;
  updateSlotTransform: (
    pageId: string,
    slotId: string,
    transform: Pick<PageSlot, 'offsetX' | 'offsetY' | 'scale'>,
  ) => void;
  undo: () => void;
  redo: () => void;
};

type InternalState = EditorState;

type Mutator = (draft: Project) => void;

const applyWithHistory = (state: InternalState, mutator: Mutator): InternalState => {
  if (!state.project) {
    return state;
  }

  const history = [...state.history, cloneProject(state.project)];
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  const project = cloneProject(state.project);
  mutator(project);

  return {
    ...state,
    project,
    history,
    future: [],
    canUndo: history.length > 0,
    canRedo: false,
  };
};

export const useEditorStore = create<EditorState>()(
  devtools((set) => ({
    project: null,
    history: [],
    future: [],
    canUndo: false,
    canRedo: false,
    selectedAssetId: null,
    isFullscreen: false,
    loadProject: (project) =>
      set(() => ({
        project,
        history: [],
        future: [],
        canUndo: false,
        canRedo: false,
      })),
    applyProject: (project) =>
      set((state) => {
        if (!state.project) {
          return {
            ...state,
            project,
            history: [],
            future: [],
            canUndo: false,
            canRedo: false,
          };
        }
        const history = [...state.history, cloneProject(state.project)];
        if (history.length > MAX_HISTORY) {
          history.shift();
        }
        return {
          ...state,
          project,
          history,
          future: [],
          canUndo: history.length > 0,
          canRedo: false,
        };
      }),
    selectAsset: (assetId) => set({ selectedAssetId: assetId }),
    toggleFullscreen: () =>
      set((state) => ({
        isFullscreen: !state.isFullscreen,
      })),
    changeAlbumSize: (albumSize) =>
      set((state) => applyWithHistory(state, (draft) => {
        draft.albumSize = albumSize;
      })),
    changePageLayout: (pageId, layoutId, slotIds) =>
      set((state) => applyWithHistory(state, (draft) => {
        draft.pages = draft.pages.map((page) =>
          page.pageId === pageId
            ? {
                ...page,
                layoutId,
                slots: slotIds.map((slotId) => {
                  const existing = page.slots.find((slot) => slot.slotId === slotId);
                  return (
                    existing ?? {
                      slotId,
                      assetId: undefined,
                      offsetX: 0,
                      offsetY: 0,
                      scale: 1,
                    }
                  );
                }),
              }
            : page,
        );
      })),
    placeAsset: (pageId, slotId, assetId) =>
      set((state) => applyWithHistory(state, (draft) => {
        draft.pages = draft.pages.map((page) => ({
          ...page,
          slots: page.slots.map((slot) =>
            slot.assetId === assetId
              ? { ...slot, assetId: undefined, offsetX: 0, offsetY: 0, scale: 1 }
              : slot,
          ),
        }));

        draft.pages = draft.pages.map((page) =>
          page.pageId === pageId
            ? {
                ...page,
                slots: page.slots.map((slot) =>
                  slot.slotId === slotId
                    ? { ...slot, assetId, offsetX: 0, offsetY: 0, scale: 1 }
                    : slot,
                ),
              }
            : page,
        );
      })),
    clearSlot: (pageId, slotId) =>
      set((state) => applyWithHistory(state, (draft) => {
        draft.pages = draft.pages.map((page) =>
          page.pageId === pageId
            ? {
                ...page,
                slots: page.slots.map((slot) =>
                  slot.slotId === slotId
                    ? { ...slot, assetId: undefined }
                    : slot,
                ),
              }
            : page,
        );
      })),
    updateSlotTransform: (pageId, slotId, transform) =>
      set((state) => applyWithHistory(state, (draft) => {
        draft.pages = draft.pages.map((page) =>
          page.pageId === pageId
            ? {
                ...page,
                slots: page.slots.map((slot) =>
                  slot.slotId === slotId
                    ? {
                        ...slot,
                        offsetX: transform.offsetX,
                        offsetY: transform.offsetY,
                        scale: transform.scale,
                      }
                    : slot,
                ),
              }
            : page,
        );
      })),
    undo: () =>
      set((state) => {
        if (state.history.length === 0) {
          return state;
        }
        const previous = state.history[state.history.length - 1];
        const futureEntry = state.project ? cloneProject(state.project) : null;
        const future = futureEntry ? [futureEntry, ...state.future] : state.future;
        const history = state.history.slice(0, -1);
        return {
          ...state,
          project: cloneProject(previous),
          history,
          future,
          canUndo: history.length > 0,
          canRedo: future.length > 0,
        };
      }),
    redo: () =>
      set((state) => {
        if (state.future.length === 0 || !state.project) {
          return state;
        }
        const [next, ...rest] = state.future;
        const history = [...state.history, cloneProject(state.project)];
        return {
          ...state,
          project: cloneProject(next),
          history,
          future: rest,
          canUndo: history.length > 0,
          canRedo: rest.length > 0,
        };
      }),
  })),
);
