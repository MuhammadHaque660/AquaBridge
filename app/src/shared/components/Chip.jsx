import { cx } from '../styles';

/** Colour and user-facing wording for each contract status. Colour is never the only signal: the word is always shown. */
const STATUS = {
  draft: ['', 'Draft'],
  active: ['ok', 'Live'],
  reserved: ['warn', 'Reserved'],
  rehomed: ['pri', 'Rehomed'],
  withdrawn: ['', 'Withdrawn'],
  pending: ['warn', 'Waiting for owner'],
  accepted: ['pri', 'Accepted'],
  declined: ['bad', 'Declined'],
  completed: ['ok', 'Completed'],
  potential_match: ['ok', 'Potential match'],
  needs_information: ['warn', 'Needs information'],
  blocked: ['bad', 'Not compatible'],
  eligible: ['ok', 'Can be listed'],
  needs_review: ['warn', 'Needs checking first'],
  restricted: ['bad', 'Restricted'],
};
const TONES = {
  '': 'bg-mute-soft text-ink',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  pri: 'bg-primary-soft text-primary-hover',
};

export const statusLabel = (status) => STATUS[status]?.[1] ?? status;

/**
 * Status tag (SH-02). Rectangular, sentence case, never clickable.
 * <Chip status="pending" />  or  <Chip tone="warn">Needs a home soon</Chip>
 */
export function Chip({ status, tone, children }) {
  const t = tone ?? STATUS[status]?.[0] ?? '';
  return (
    <strong
      className={cx(
        'rounded-ab-sm inline-block px-2 py-0.5 text-xs leading-snug font-semibold whitespace-nowrap',
        TONES[t],
      )}
    >
      {children ?? statusLabel(status)}
    </strong>
  );
}
