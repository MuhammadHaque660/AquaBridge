import { kv } from '../../shared/styles';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Care ranges for a species as a summary list (F-05). One component for the listing page, the care panel,
 * the compatibility check and the species guide, so units and wording are always the same.
 * `full` adds planting depth and light.
 */
export function CareList({ species: s, full = true, className }) {
  if (!s?.temp) return null;
  return (
    <dl className={className ? `${kv} ${className}` : kv}>
      <dt>Water temperature</dt>
      <dd>
        {s.temp[0]} to {s.temp[1]} °C
      </dd>
      <dt>pH</dt>
      <dd>
        {s.ph[0].toFixed(1)} to {s.ph[1].toFixed(1)}
      </dd>
      <dt>Smallest tank or pond</dt>
      <dd>{s.minVol} litres</dd>
      <dt>Lives in</dt>
      <dd>{cap(s.habitats.join(' or '))}</dd>
      {full && s.minDepth && (
        <>
          <dt>Planting depth</dt>
          <dd>At least {s.minDepth} cm</dd>
        </>
      )}
      {full && s.light && (
        <>
          <dt>Light</dt>
          <dd>{cap(s.light)}</dd>
        </>
      )}
    </dl>
  );
}
