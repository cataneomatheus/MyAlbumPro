import type { AlbumSize } from '../types';

export function EditorToolbar({
  albumSizes,
  selectedSize,
  canUndo,
  canRedo,
  onAlbumSizeChange,
  onSave,
  onAutoFill,
  onPreview,
  onUndo,
  onRedo,
}: {
  albumSizes: AlbumSize[];
  selectedSize: string;
  canUndo: boolean;
  canRedo: boolean;
  onAlbumSizeChange: (size: string) => void;
  onSave: () => void;
  onAutoFill: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Tamanho:</span>
        <select
          value={selectedSize}
          onChange={(event) => onAlbumSizeChange(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100"
        >
          {albumSizes.map((size) => (
            <option key={size.code} value={size.code}>
              {size.code}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Desfazer
        </button>
        <button
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          onClick={onRedo}
          disabled={!canRedo}
        >
          Refazer
        </button>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500"
          onClick={onAutoFill}
        >
          Autopreencher
        </button>
        <button
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500"
          onClick={onPreview}
        >
          Pré-visualizar
        </button>
        <button
          className="rounded-lg bg-emerald-500 px-3 py-1.5 font-medium text-white hover:bg-emerald-400"
          onClick={onSave}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default EditorToolbar;
