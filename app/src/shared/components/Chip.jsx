import { cx } from '../styles';

/** Which colour each contract status uses. Every status also shows its name, so colour is never the only signal. */
const TONE_OF = {
  draft: '',
  active: 'ok',
  reserved: 'warn',
  rehomed: 'pri',
  withdrawn: '',
  pending: 'warn',
  accepted: 'pri',
  declined: 'bad',
  completed: 'ok',
  potential_match: 'ok',
  needs_information: 'warn',
  blocked: 'bad',
  eligible: 'ok',
  needs_review: 'warn',
  restricted: 'bad',
};
const TONES = {
  '': 'bg-mute-soft text-ink-2',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  pri: 'bg-primary-soft text-primary',
};

/** Status chip (SH-02). <Chip status="pending" /> or <Chip tone="warn" plain>Needs a home soon</Chip> */
export function Chip({ status, tone, plain, children }) {
  const t = tone ?? TONE_OF[status] ?? '';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full py-[3px] pr-[9px] pl-2 font-mono text-[0.75rem] font-medium tracking-[.02em] whitespace-nowrap',
        TONES[t],
        !plain && "before:size-[7px] before:rounded-full before:bg-current before:content-['']",
      )}
    >
      {children ?? status.replace('_', ' ')}
    </span>
  );
}
