import type { CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'classnames';
import { useEditorStore } from '../store/editorStore';
import type { Asset, Layout, Page } from '../types';

type SlotViewProps = {
  layoutSlot: Layout['slots'][number];
  pageSlot?: Page['slots'][number];
  asset?: Asset;
  pageId: string;
};

function SlotView({ layoutSlot, pageSlot, asset, pageId }: SlotViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${layoutSlot.slotId}`,
    data: { type: 'slot', slotId: layoutSlot.slotId, pageId },
  });
  const clearSlot = useEditorStore((state) => state.clearSlot);

  const style: CSSProperties = {
    left: `${layoutSlot.x * 100}%`,
    top: `${layoutSlot.y * 100}%`,
    width: `${layoutSlot.width * 100}%`,
    height: `${layoutSlot.height * 100}%`,
  };

  const hasAsset = !!pageSlot?.assetId && asset;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => clearSlot(pageId, layoutSlot.slotId)}
      className={clsx(
        'absolute cursor-pointer rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/40 transition',
        isOver && 'border-emerald-400 bg-emerald-400/10',
        hasAsset && 'border-slate-300 bg-black/40',
      )}
    >
      {hasAsset ? (
        <img
          src={asset!.thumbnailUrl || `https://picsum.photos/seed/${asset!.assetId}/360/360`}
          alt={asset!.fileName}
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
          {layoutSlot.slotId} (duplo clique limpa)
        </div>
      )}
    </div>
  );
}

export function PageCanvas({ layout, page, assets }: { layout: Layout; page: Page; assets: Record<string, Asset> }) {
  return (
    <div className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950">
        {layout.slots.map((slot) => {
          const pageSlot = page.slots.find((item) => item.slotId === slot.slotId);
          const asset = pageSlot?.assetId ? assets[pageSlot.assetId] : undefined;
          return (
            <SlotView key={slot.slotId} layoutSlot={slot} pageSlot={pageSlot} asset={asset} pageId={page.pageId} />
          );
        })}
      </div>
    </div>
  );
}

export default PageCanvas;
