import { GROUP_LABEL } from '../../services/contracts';
import { cx } from '../styles';

const BG = { trop: 'bg-plate-trop', cold: 'bg-plate-cold', plant: 'bg-plate-plant', pond: 'bg-plate-pond' };

export function Glyph({ kind }) {
  return kind === 'plant' ? (
    <svg width="40" height="44" viewBox="0 0 40 44" fill="none" aria-hidden="true">
      <path
        d="M20 42V12M20 30c-8 0-14-6-14-14 8 0 14 6 14 14Zm0-8c8 0 14-6 14-14-8 0-14 6-14 14Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ) : (
    <svg width="56" height="32" viewBox="0 0 56 32" fill="none" aria-hidden="true">
      <path
        d="M4 16c8-11 26-13 36-2l12-8v20l-12-8C30 29 12 27 4 16Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="14" cy="14" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Specimen plate (SH-02): scientific name on a habitat-coloured panel. Used instead of photos in Sprint 1. */
export function Plate({ species: s, detail, tag }) {
  const plant = s.kind === 'plant';
  return (
    <div
      className={cx(
        'text-ink relative flex flex-col justify-end gap-0.5 overflow-hidden p-4',
        BG[s.group],
        detail ? 'rounded-ab min-h-[220px]' : 'min-h-[132px]',
      )}
    >
      <span className="absolute top-3 right-3 opacity-55">
        <Glyph kind={plant ? 'plant' : 'animal'} />
      </span>
      {tag && <span className="absolute top-4 left-4">{tag}</span>}
      <span className="font-mono text-[0.6875rem] tracking-[.1em] uppercase opacity-80">
        {plant ? 'Plant' : 'Animal'} · {GROUP_LABEL[s.group] || ''}
      </span>
      <span
        className={cx(
          'font-display max-w-[80%] leading-[1.15] font-medium italic',
          detail ? 'text-[1.75rem]' : 'text-[1.25rem]',
        )}
      >
        {s.sci}
      </span>
    </div>
  );
}

/** Parameter strip: temperature, pH, volume and habitat in the mono face. */
export function Params({ species: s }) {
  if (!s.temp) return null;
  const p =
    'rounded-ab-sm border border-line px-[7px] py-0.5 font-mono text-[0.75rem] text-ink-2 tabular-nums [&_b]:font-medium [&_b]:text-ink';
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={p}>
        <b>
          {s.temp[0]}–{s.temp[1]}
        </b>{' '}
        °C
      </span>
      <span className={p}>
        pH{' '}
        <b>
          {s.ph[0].toFixed(1)}–{s.ph[1].toFixed(1)}
        </b>
      </span>
      <span className={p}>
        ≥ <b>{s.minVol}</b> L
      </span>
      {s.habitats && <span className={p}>{s.habitats.join(' / ')}</span>}
    </div>
  );
}
