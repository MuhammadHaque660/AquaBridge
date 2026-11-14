import { kv } from '../../shared/styles';
import { blank } from './compat';

/** Owner-safe habitat summary (M-05). Shawn's inbox and the request form both use this. */
export function HabitatSummary({ habitat: h }) {
  if (!h) return null;
  return (
    <dl className={kv} data-tour="habitat-summary">
      <dt>Habitat</dt>
      <dd>{h.type}</dd>
      <dt>Volume</dt>
      <dd>{blank(h.volume) ? '—' : `${h.volume} L`}</dd>
      <dt>Temperature</dt>
      <dd>{blank(h.tempMin) ? '—' : `${h.tempMin}–${h.tempMax} °C`}</dd>
      <dt>pH</dt>
      <dd>{blank(h.ph) ? '—' : h.ph}</dd>
      <dt>Filter</dt>
      <dd>{h.filter || '—'}</dd>
      <dt>Cycled</dt>
      <dd>{h.cycled || '—'}</dd>
      {h.type === 'pond' && (
        <>
          <dt>Depth</dt>
          <dd>{blank(h.depth) ? '—' : `${h.depth} cm`}</dd>
        </>
      )}
      <dt>Living there</dt>
      <dd className="font-body!">{h.inhabitants || '—'}</dd>
    </dl>
  );
}
