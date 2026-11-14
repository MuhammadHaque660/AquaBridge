import { cx } from '../../shared/styles';

/** Range bar (M-03): the species range against the habitat's values, drawn to scale. */
export function RangeBar({ bar: b }) {
  const pc = (v) => Math.max(0, Math.min(100, ((v - b.lo) / (b.hi - b.lo)) * 100));
  const ticks = b.unit === 'pH' ? [5, 6, 7, 8, 9] : [0, 8, 16, 24, 32];
  return (
    <div aria-hidden="true">
      <div className="relative mt-1 h-[26px]">
        <div className="bg-surface-2 absolute top-2.5 right-0 left-0 h-1.5 rounded-[3px]" />
        <div
          className="border-primary bg-primary-soft absolute top-2 h-2.5 rounded-[3px] border"
          style={{ left: `${pc(b.min)}%`, width: `${pc(b.max) - pc(b.min)}%` }}
        />
        <div
          className={cx('absolute top-[3px] h-5 min-w-1 rounded-[2px] opacity-90', b.ok ? 'bg-ok' : 'bg-bad')}
          style={{ left: `calc(${pc(b.a)}% - 2px)`, width: `calc(${pc(b.b) - pc(b.a)}% + 4px)` }}
        />
      </div>
      <div className="text-ink-2 flex justify-between font-mono text-[0.6875rem]">
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
