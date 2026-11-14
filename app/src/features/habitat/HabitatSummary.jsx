import { kv } from '../../shared/styles';
import { blank } from './compat';

const YES_NO = { yes: 'Yes', no: 'No', unsure: 'Not sure' };
const cap = (v) => (v ? v[0].toUpperCase() + v.slice(1) : v);

/** Owner-safe habitat summary (M-05). Shawn's inbox and the request form both use this. */
export function HabitatSummary({ habitat: h }) {
  if (!h) return null;
  return (
    <dl className={kv} data-tour="habitat-summary">
      <dt>Type</dt>
      <dd>{cap(h.type)}</dd>
      <dt>Volume</dt>
      <dd>{blank(h.volume) ? 'Not given' : `${h.volume} litres`}</dd>
      <dt>Temperature</dt>
      <dd>{blank(h.tempMin) ? 'Not given' : `${h.tempMin} to ${h.tempMax} °C`}</dd>
      <dt>pH</dt>
      <dd>{blank(h.ph) ? 'Not given' : h.ph}</dd>
      <dt>Filter running</dt>
      <dd>{YES_NO[h.filter] || 'Not given'}</dd>
      <dt>Filter cycled</dt>
      <dd>{YES_NO[h.cycled] || 'Not given'}</dd>
      {h.type === 'pond' && (
        <>
          <dt>Deepest point</dt>
          <dd>{blank(h.depth) ? 'Not given' : `${h.depth} cm`}</dd>
        </>
      )}
      <dt>Already living there</dt>
      <dd>{h.inhabitants || 'Not given'}</dd>
    </dl>
  );
}
