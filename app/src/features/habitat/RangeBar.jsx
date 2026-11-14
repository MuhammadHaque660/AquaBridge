import { cx } from '../../shared/styles';

/** Range bar (M-03): the species range against the habitat's values, drawn to scale. */
export function RangeBar({ bar: b }) {
  const pc = (v) => Math.max(0, Math.min(100, ((v - b.lo) / (b.hi - b.lo)) * 100));
  const ticks = b.unit === 'pH' ? [5, 6, 7, 8, 9] : [0, 8, 16, 24, 32];
  return (
    <div aria-hidden="true" className="max-w-md">
      <div className="relative mt-1 h-6">
        <div className="bg-line absolute top-2.5 right-0 left-0 h-1 rounded-full" />
        <div
          className="bg-primary/25 absolute top-2 h-2 rounded-full"
          style={{ left: `${pc(b.min)}%`, width: `${pc(b.max) - pc(b.min)}%` }}
        />
        <div
          className={cx('rounded-ab-sm absolute top-1 h-4 min-w-1', b.ok ? 'bg-ok' : 'bg-bad')}
          style={{ left: `calc(${pc(b.a)}% - 2px)`, width: `calc(${pc(b.b) - pc(b.a)}% + 4px)` }}
        />
      </div>
      <div className="text-ink-2 flex justify-between text-xs tabular-nums">
        {ticks.map((t) => (
          <span key={t}>
            {t}
            {b.unit === '°C' ? '°' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
