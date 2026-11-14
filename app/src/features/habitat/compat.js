/** Compatibility rules (M-04), habitat validation (M-01) and the owner-safe summary (M-05). Midhir. Example rules only. */
import { speciesFor } from '../../services/species';

export const blank = (v) => v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v));

/** Owner-safe copy of a habitat: no name, no address. Copied into a request when it is sent. */
export const safeSummary = (h) =>
  h && {
    type: h.type,
    volume: h.volume,
    tempMin: h.tempMin,
    tempMax: h.tempMax,
    ph: h.ph,
    filter: h.filter,
    cycled: h.cycled,
    depth: h.depth,
    inhabitants: h.inhabitants,
  };

/** @returns {{ outcome: 'potential_match'|'needs_information'|'blocked', checks: {label, status, detail, bar?}[] }} */
export function evaluateCompat(listing, h) {
  const s = speciesFor(listing);
  const checks = [];
  const add = (label, status, detail, bar) => checks.push({ label, status, detail, bar });

  // Habitat type (hard rule)
  if (s.habitats.includes(h.type)) add('Habitat type', 'pass', `${s.common} can live in a ${h.type}.`);
  else add('Habitat type', 'fail', `${s.common} needs a ${s.habitats.join(' or ')}. Your habitat is a ${h.type}.`);

  // Temperature (hard rule)
  if (blank(h.tempMin) || blank(h.tempMax))
    add('Water temperature', 'missing', 'Add the lowest and highest temperature your water usually reaches.');
  else {
    const ok = +h.tempMin >= s.temp[0] && +h.tempMax <= s.temp[1];
    add(
      'Water temperature',
      ok ? 'pass' : 'fail',
      ok
        ? `Your ${h.tempMin}–${h.tempMax} °C sits inside the ${s.temp[0]}–${s.temp[1]} °C range.`
        : `Your ${h.tempMin}–${h.tempMax} °C goes outside the ${s.temp[0]}–${s.temp[1]} °C this species needs.`,
      { lo: 0, hi: 32, min: s.temp[0], max: s.temp[1], a: +h.tempMin, b: +h.tempMax, ok, unit: '°C' },
    );
  }

  // pH (advice only: it can be adjusted)
  if (blank(h.ph))
    add('pH', 'missing', 'Add your pH reading. A liquid test kit gives a more reliable value than strips.');
  else {
    const ok = +h.ph >= s.ph[0] && +h.ph <= s.ph[1];
    const range = `${s.ph[0].toFixed(1)}–${s.ph[1].toFixed(1)}`;
    add(
      'pH',
      ok ? 'pass' : 'advice',
      ok
        ? `pH ${(+h.ph).toFixed(1)} is inside ${range}.`
        : `pH ${(+h.ph).toFixed(1)} is outside ${range}. Talk to the owner about adjusting it slowly before handover.`,
      { lo: 5, hi: 9, min: s.ph[0], max: s.ph[1], a: +h.ph, b: +h.ph, ok, unit: 'pH' },
    );
  }

  // Volume (hard rule)
  if (blank(h.volume)) add('Water volume', 'missing', 'Add how many litres your tank or pond holds.');
  else
    add(
      'Water volume',
      +h.volume >= s.minVol ? 'pass' : 'fail',
      +h.volume >= s.minVol
        ? `${h.volume} L meets the ${s.minVol} L minimum.`
        : `${h.volume} L is below the ${s.minVol} L minimum for this listing.`,
    );

  if (s.kind === 'animal') {
    if (blank(h.filter)) add('Filtration', 'missing', 'Tell us whether the habitat has a filter.');
    else
      add(
        'Filtration',
        h.filter === 'yes' ? 'pass' : 'fail',
        h.filter === 'yes' ? 'A filter is running.' : 'Fish and shrimp need a running filter.',
      );
    if (blank(h.cycled) || h.cycled === 'unsure')
      add(
        'Cycled water',
        'missing',
        'Confirm whether the filter is cycled. Testing for ammonia and nitrite will tell you.',
      );
    else
      add(
        'Cycled water',
        h.cycled === 'yes' ? 'pass' : 'advice',
        h.cycled === 'yes'
          ? 'The filter is cycled.'
          : 'Cycle the filter before the handover so ammonia does not build up.',
      );
  }
  if (s.minDepth) {
    if (blank(h.depth)) add('Pond depth', 'missing', 'Add the depth of the deepest part of your pond.');
    else
      add(
        'Pond depth',
        +h.depth >= s.minDepth ? 'pass' : 'fail',
        +h.depth >= s.minDepth ? `${h.depth} cm is deep enough.` : `Needs at least ${s.minDepth} cm.`,
      );
  }
  if (s.light && h.light && s.light !== h.light)
    add('Lighting', 'advice', `${s.common} prefers ${s.light} light. Yours is ${h.light}.`);

  const outcome = checks.some((c) => c.status === 'fail')
    ? 'blocked'
    : checks.some((c) => c.status === 'missing')
      ? 'needs_information'
      : 'potential_match';
  return { outcome, checks };
}

export const NUMERIC_HABITAT_FIELDS = ['volume', 'tempMin', 'tempMax', 'ph', 'depth'];

/** Turn form strings into numbers (or '' when blank). */
export function normaliseHabitat(d) {
  const out = { ...d };
  NUMERIC_HABITAT_FIELDS.forEach(
    (k) => (out[k] = out[k] === '' || out[k] === undefined || out[k] === null ? '' : +out[k]),
  );
  return out;
}

export function validateHabitat(d) {
  const err = {};
  if (!d.name?.trim()) err.name = 'Give this habitat a name.';
  if (d.volume !== '' && (d.volume < 5 || d.volume > 100000)) err.volume = 'Enter between 5 and 100,000 litres.';
  if (d.ph !== '' && (d.ph < 4 || d.ph > 10)) err.ph = 'pH is usually between 4 and 10.';
  if (d.tempMin !== '' && d.tempMax !== '' && d.tempMin > d.tempMax)
    err.tempMax = 'Highest must be at least the lowest.';
  if ((d.tempMin === '') !== (d.tempMax === ''))
    err[d.tempMin === '' ? 'tempMin' : 'tempMax'] = 'Add both temperatures, or leave both blank.';
  return err;
}

/** How many of the key details are missing (shown on habitat cards). */
export const missingCount = (h) =>
  ['volume', 'tempMin', 'ph', 'filter', 'cycled'].filter((k) => blank(h[k]) || h[k] === 'unsure').length;
