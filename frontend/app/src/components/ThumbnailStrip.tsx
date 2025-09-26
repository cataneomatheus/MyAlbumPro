import { useDraggable } from '@dnd-kit/core';
import clsx from 'classnames';
import type { Asset } from '../types';
import { useEditorStore } from '../store/editorStore';

function DraggableThumb({ asset, isSelected }: { asset: Asset; isSelected: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: asset.assetId,
    data: { type: 'asset', assetId: asset.assetId },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  const selectAsset = useEditorStore((state) => state.selectAsset);

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => selectAsset(asset.assetId)}
      className={clsx(
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border transition',
        isSelected ? 'border-emerald-400 shadow-lg shadow-emerald-500/30' : 'border-slate-700 hover:border-slate-500',
        isDragging && 'z-20 opacity-80',
      )}
    >
      <img
        src={asset.thumbnailUrl || `https://picsum.photos/seed/${asset.assetId}/120/120`}
        alt={asset.fileName}
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
        {asset.fileName}
      </span>
    </button>
  );
}

export function ThumbnailStrip({ assets }: { assets: Asset[] }) {
  const selectedAssetId = useEditorStore((state) => state.selectedAssetId);

  return (
    <div className="flex gap-3 overflow-x-auto border-t border-slate-800 bg-slate-900/60 px-4 py-3">
      {assets.map((asset) => (
        <DraggableThumb key={asset.assetId} asset={asset} isSelected={selectedAssetId === asset.assetId} />
      ))}
    </div>
  );
}

export default ThumbnailStrip;










