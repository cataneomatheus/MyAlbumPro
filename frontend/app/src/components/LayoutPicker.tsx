import clsx from 'classnames';
import type { Layout } from '../types';

export function LayoutPicker({
  layouts,
  currentLayoutId,
  onSelect,
}: {
  layouts: Layout[];
  currentLayoutId: string;
  onSelect: (layout: Layout) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300">Layouts disponíveis</h3>
      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout)}
            className={clsx(
              'rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-left text-xs text-slate-300 transition hover:border-emerald-400',
              layout.id === currentLayoutId && 'border-emerald-400 shadow shadow-emerald-500/20',
            )}
          >
            <p className="font-medium text-white">{layout.name}</p>
            <div className="mt-2 grid aspect-[4/3] grid-cols-6 gap-1">
              {layout.slots.map((slot) => (
                <div
                  key={slot.slotId}
                  style={{
                    gridColumn: `span ${Math.max(1, Math.round(slot.width * 6))}`,
                    gridRow: `span ${Math.max(1, Math.round(slot.height * 4))}`,
                  }}
                  className="rounded bg-slate-800"
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LayoutPicker;
