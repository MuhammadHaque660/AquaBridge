import { cx } from '../styles';

/** Handover tracker (S-10): accepted → owner confirmed → adopter confirmed → complete. */
export function Tracker({ request: r }) {
  const steps = [
    ['Request accepted', ['accepted', 'completed'].includes(r.status)],
    ['Owner confirmed', r.ownerConfirmed],
    ['Adopter confirmed', r.adopterConfirmed],
    ['Rehoming complete', r.status === 'completed'],
  ];
  const firstTodo = steps.findIndex((s) => !s[1]);
  return (
    <ol className="track" aria-label="Handover progress" data-tour="track">
      {steps.map(([t, done], i) => (
        <li key={t} className={cx(done && 'done', !done && i === firstTodo && 'now')}>
          {t}
          {done && <span className="sr-only"> (done)</span>}
        </li>
      ))}
    </ol>
  );
}
