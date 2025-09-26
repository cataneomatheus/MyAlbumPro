import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { ThumbnailStrip } from '../components/ThumbnailStrip';
import PageCanvas from '../components/PageCanvas';
import LayoutPicker from '../components/LayoutPicker';
import { EditorToolbar } from '../components/EditorToolbar';
import FullScreenViewer from '../components/FullScreenViewer';
import { useEditorStore } from '../store/editorStore';
import type { AlbumSize, Asset, Layout, Project } from '../types';
import { useAuth } from '../context/AuthContext';

type Status = 'idle' | 'saving';

function createEmptyProject(layout: Layout): Project {
  return {
    projectId: crypto.randomUUID(),
    title: 'Novo Projeto',
    albumSize: '30x30',
    ownerId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [
      {
        pageId: crypto.randomUUID(),
        index: 0,
        layoutId: layout.id,
        slots: layout.slots.map((slot) => ({ slotId: slot.slotId, offsetX: 0, offsetY: 0, scale: 1 })),
      },
    ],
  };
}

function EditorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.projectId ?? 'new';
  const [albumSizes, setAlbumSizes] = useState<AlbumSize[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isPreview, setIsPreview] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const project = useEditorStore((state) => state.project);
  const loadProject = useEditorStore((state) => state.loadProject);
  const applyProject = useEditorStore((state) => state.applyProject);
  const changeAlbumSize = useEditorStore((state) => state.changeAlbumSize);
  const changePageLayout = useEditorStore((state) => state.changePageLayout);
  const placeAsset = useEditorStore((state) => state.placeAsset);
  const selectAsset = useEditorStore((state) => state.selectAsset);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
        navigate('/login', { replace: true });
        return;
      }
      setError((err as Error).message);
    },
    [navigate],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;
    async function load() {
      try {
        setIsLoading(true);
        const [sizes, layoutData, assetData] = await Promise.all([
          api.getAlbumSizes().catch(() => []),
          api.getLayouts(),
          api.listAssets().catch(() => []),
        ]);

        if (!active) {
          return;
        }

        setAlbumSizes(sizes);
        setLayouts(layoutData);
        setAssets(assetData);

        if (projectId === 'new') {
          const defaultLayout = layoutData[0];
          if (defaultLayout) {
            loadProject(createEmptyProject(defaultLayout));
          } else {
            setError('Nenhum layout disponivel.');
          }
        } else {
          const projectResponse = await api.getProject(projectId);
          if (!active) {
            return;
          }
          loadProject(projectResponse);
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [projectId, user?.userId]);

  const layoutMap = useMemo(() => Object.fromEntries(layouts.map((layout) => [layout.id, layout])), [layouts]);
  const assetMap = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.assetId, asset])), [assets]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const assetId = event.active.data.current?.assetId as string | undefined;
      const slotId = event.over?.data.current?.slotId as string | undefined;
      const pageId = event.over?.data.current?.pageId as string | undefined;
      if (!assetId || !slotId || !pageId) return;
      placeAsset(pageId, slotId, assetId);
      selectAsset(assetId);
    },
    [placeAsset, selectAsset],
  );

  const handleSave = async () => {
    if (!project) return;
    try {
      setStatus('saving');
      const updated = await api.updateProject(project);
      applyProject(updated);
      setError(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setStatus('idle');
    }
  };

  const handleAutoFill = async () => {
    if (!project) return;
    try {
      const updated = await api.autoFill(project.projectId);
      applyProject(updated);
      setError(null);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleAlbumSizeChange = (size: string) => {
    if (!project) return;
    changeAlbumSize(size);
  };

  if (authLoading || isLoading || !project || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Carregando...</div>;
  }

  const currentLayout = layoutMap[project.pages[0].layoutId];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <EditorToolbar
          albumSizes={albumSizes}
          selectedSize={project.albumSize}
          canUndo={canUndo}
          canRedo={canRedo}
          onAlbumSizeChange={handleAlbumSizeChange}
          onAutoFill={handleAutoFill}
          onPreview={() => setIsPreview(true)}
          onSave={handleSave}
          onUndo={undo}
          onRedo={redo}
        />
        {status === 'saving' ? <div className="text-xs text-emerald-300">Salvando alteracoes...</div> : null}
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <DndContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
              {currentLayout ? (
                <PageCanvas layout={currentLayout} page={project.pages[0]} assets={assetMap} />
              ) : (
                <p>Layout Nao encontrado.</p>
              )}
            </div>
            <aside className="space-y-6">
              <LayoutPicker
                layouts={layouts}
                currentLayoutId={project.pages[0].layoutId}
                onSelect={(layout) =>
                  changePageLayout(
                    project.pages[0].pageId,
                    layout.id,
                    layout.slots.map((slot) => slot.slotId),
                  )
                }
              />
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">Atalhos</p>
                <ul className="mt-2 space-y-1">
                  <li>Desfazer: Ctrl+Z</li>
                  <li>Refazer: Ctrl+Shift+Z</li>
                  <li>Preview: Barra de espaco</li>
                </ul>
              </div>
            </aside>
          </DndContext>
        </div>
        <ThumbnailStrip assets={assets} />
      </div>
      {isPreview ? (
        <FullScreenViewer
          project={project}
          layouts={layouts}
          assets={assets}
          onClose={() => setIsPreview(false)}
        />
      ) : null}
    </div>
  );
}

export default EditorPage;












