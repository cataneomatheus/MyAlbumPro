import { useState } from 'react';
import type { Asset, Layout, Project } from '../types';
import PageCanvas from './PageCanvas';

type ViewerProps = {
  project: Project;
  layouts: Layout[];
  assets: Asset[];
  onClose: () => void;
};

export function FullScreenViewer({ project, layouts, assets, onClose }: ViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const layoutMap = Object.fromEntries(layouts.map((layout) => [layout.id, layout]));
  const assetMap = Object.fromEntries(assets.map((asset) => [asset.assetId, asset]));
  const page = project.pages[pageIndex];
  const layout = layoutMap[page.layoutId];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div>
          <h2 className="text-lg font-semibold">Visualização</h2>
          <p className="text-xs text-slate-400">
            Página {pageIndex + 1} de {project.pages.length}
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:border-slate-500"
          onClick={onClose}
        >
          Fechar
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {layout ? <PageCanvas layout={layout} page={page} assets={assetMap} /> : <p>Layout não encontrado</p>}
      </main>
      <footer className="flex items-center justify-between border-t border-slate-800 px-6 py-3">
        <button
          className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:border-slate-500"
          onClick={() => setPageIndex((idx) => Math.max(0, idx - 1))}
          disabled={pageIndex === 0}
        >
          Página anterior
        </button>
        <button
          className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:border-slate-500"
          onClick={() => setPageIndex((idx) => Math.min(project.pages.length - 1, idx + 1))}
          disabled={pageIndex === project.pages.length - 1}
        >
          Próxima página
        </button>
      </footer>
    </div>
  );
}

export default FullScreenViewer;
