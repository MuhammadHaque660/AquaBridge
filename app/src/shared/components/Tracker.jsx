import { cx } from '../styles';

/** Handover progress (S-10): a short vertical checklist so both sides see what is done and what is next. */
export function Tracker({ request: r }) {
  const steps = [
    ['Request accepted', ['accepted', 'completed'].includes(r.status)],
    ['Owner confirmed the handover', r.ownerConfirmed],
    ['Adopter confirmed the handover', r.adopterConfirmed],
    ['Rehoming complete', r.status === 'completed'],
  ];
  const firstTodo = steps.findIndex((s) => !s[1]);
  return (
    <ol className="m-0 grid list-none gap-0 p-0" aria-label="Handover progress" data-tour="track">
      {steps.map(([t, done], i) => (
        <li
          key={t}
          className={cx(
            'relative flex items-center gap-3 py-1.5 text-sm',
            i < steps.length - 1 &&
              "before:absolute before:top-[30px] before:left-[11px] before:h-[calc(100%-18px)] before:w-0.5 before:content-['']",
            i < steps.length - 1 && (done ? 'before:bg-primary' : 'before:bg-line'),
          )}
        >
          <span
            aria-hidden="true"
            className={cx(
              'grid size-6 flex-none place-items-center rounded-full border-2 text-xs font-bold',
              done
                ? 'border-primary bg-primary text-white'
                : i === firstTodo
                  ? 'border-primary bg-surface'
                  : 'border-line bg-surface',
            )}
          >
            {done ? '✓' : ''}
          </span>
          <span className={cx(done ? 'text-ink' : i === firstTodo ? 'text-ink font-semibold' : 'text-ink-2')}>
            {t}
            <span className="sr-only">{done ? ' (done)' : i === firstTodo ? ' (next)' : ' (not started)'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
