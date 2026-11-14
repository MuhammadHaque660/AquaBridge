import { describe, expect, it } from 'vitest';
import { byId, seed } from '../services/seed';
import { evaluateIntake, validateStep } from './guidance/rules';
import { evaluateCompat, normaliseHabitat, validateHabitat } from './habitat/compat';
import { validateListing } from './listings/validate';

describe('guidance rules (F-04)', () => {
  it('supported and healthy is eligible', () => {
    expect(evaluateIntake({ speciesId: 'SP-002', condition: 'healthy' }).outcome).toBe('eligible');
  });
  it('restricted species are restricted', () => {
    expect(evaluateIntake({ speciesId: 'SP-008', condition: 'healthy' }).outcome).toBe('restricted');
  });
  it('unidentified or unwell needs review', () => {
    expect(evaluateIntake({ speciesId: 'SP-000', condition: 'healthy' }).outcome).toBe('needs_review');
    expect(evaluateIntake({ speciesId: 'SP-002', condition: 'unwell' }).outcome).toBe('needs_review');
  });
  it('validates each questionnaire step', () => {
    expect(validateStep(1, {})).toHaveProperty('kind');
    expect(validateStep(3, { condition: 'minor', reason: 'moving' })).toHaveProperty('health');
    expect(validateStep(4, { location: 'Ealing, W5', urgency: 'week' })).toEqual({});
  });
});

describe('compatibility rules (M-04)', () => {
  const s = seed();
  const L = (id) => byId(s.listings, id);
  const H = (id) => byId(s.habitats, id);
  it('a matching tank is a potential match', () => {
    expect(evaluateCompat(L('L-1045'), H('H-201')).outcome).toBe('potential_match');
  });
  it('missing details give needs_information', () => {
    expect(evaluateCompat(L('L-1044'), H('H-203')).outcome).toBe('needs_information');
  });
  it('a failed hard rule blocks', () => {
    expect(evaluateCompat(L('L-1046'), H('H-201')).outcome).toBe('blocked');
  });
  it('pH outside the range is advice only', () => {
    const r = evaluateCompat(L('L-1045'), { ...H('H-201'), ph: 7.6 });
    expect(r.checks.find((c) => c.label === 'pH').status).toBe('advice');
    expect(r.outcome).toBe('potential_match');
  });
});

describe('form validation', () => {
  it('habitat ranges and paired temperatures', () => {
    expect(
      validateHabitat(normaliseHabitat({ name: 'Tank', volume: '2', tempMin: '', tempMax: '', ph: '', depth: '' })),
    ).toHaveProperty('volume');
    expect(
      validateHabitat(normaliseHabitat({ name: 'Tank', volume: '', tempMin: '20', tempMax: '', ph: '', depth: '' })),
    ).toHaveProperty('tempMax');
    expect(
      validateHabitat(
        normaliseHabitat({ name: 'Tank', volume: '60', tempMin: '20', tempMax: '24', ph: '7', depth: '' }),
      ),
    ).toEqual({});
  });
  it('listing needs a title, quantity, location and description', () => {
    expect(Object.keys(validateListing({ title: 'Short', qty: 0, location: '', description: '' }))).toEqual([
      'title',
      'qty',
      'location',
      'description',
    ]);
  });
});
