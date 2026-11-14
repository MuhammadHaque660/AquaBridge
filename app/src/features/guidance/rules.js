/** Guidance rules (F-04, Farhan) and questionnaire validation (F-02). Example rules only. */
import { CONDITION } from '../../services/contracts';
import { SPECIES } from '../../services/species';

export const STEPS = ['Organism', 'Species', 'Condition', 'Location'];

/** @returns {{ outcome: 'eligible'|'needs_review'|'restricted', reasons: string[] }} */
export function evaluateIntake(a) {
  const s = SPECIES[a.speciesId];
  const reasons = [];
  if (!s) return { outcome: 'needs_review', reasons: ['No species was selected.'] };
  if (s.status === 'restricted') {
    reasons.push(
      `${s.common} is in our example list of restricted species.`,
      'Ordinary listings cannot be published for restricted species.',
    );
    return { outcome: 'restricted', reasons };
  }
  if (s.status === 'unknown')
    reasons.push(
      'The organism has not been identified, so we cannot check whether it is restricted or what care it needs.',
    );
  if (a.condition === 'unwell')
    reasons.push('It is unwell or under treatment. Moving it now could spread disease to an adopter’s tank or pond.');
  if (reasons.length) return { outcome: 'needs_review', reasons };
  reasons.push(
    `${s.common} is a supported species with care information on AquaBridge.`,
    `Condition is recorded as “${CONDITION[a.condition].toLowerCase()}”.`,
    'Nothing in your answers suggests a restriction.',
  );
  return { outcome: 'eligible', reasons };
}

/** Errors for one questionnaire step, keyed by field name. Empty object means valid. */
export function validateStep(n, a) {
  const e = {};
  if (n === 1 && !a.kind) e.kind = 'Choose an animal or a plant.';
  if (n === 2) {
    if (!a.speciesId) e.speciesId = 'Choose a species, or pick “I’m not sure”.';
    if (!(+a.quantity >= 1)) e.quantity = 'Enter a number of 1 or more.';
  }
  if (n === 3) {
    if (!a.condition) e.condition = 'Choose the closest description.';
    if (a.condition && a.condition !== 'healthy' && !a.health?.trim())
      e.health = 'Describe the problem so we can give the right guidance.';
    if (!a.reason) e.reason = 'Choose a reason.';
  }
  if (n === 4) {
    if (!a.location || a.location.trim().length < 3)
      e.location = 'Enter a town and postcode district, like “Ealing, W5”.';
    if (!a.urgency) e.urgency = 'Choose how soon.';
  }
  return e;
}
