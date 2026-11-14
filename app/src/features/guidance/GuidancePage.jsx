import { useNavigate } from 'react-router';
import { freshIntake } from '../../services/seed';
import { SPECIES } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Notice } from '../../shared/components/Feedback';
import { cx, page, reasons, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { qwrap } from './RehomePage';
import { evaluateIntake } from './rules';

const EDGE = { ok: 'border-ok', warn: 'border-warn', bad: 'border-bad' };

/** Result box with a thick coloured left edge, shared by guidance (F-04) and compatibility (M-04). */
export function Outcome({ tone, children, className, ...rest }) {
  return (
    <section className={cx('rounded-r-ab bg-mist grid gap-3 border-l-8 px-6 py-5', EDGE[tone], className)} {...rest}>
      {children}
    </section>
  );
}

const HEAD = {
  eligible: ['ok', 'You can create a listing', 'Your answers fit our guidance for a public listing.'],
  needs_review: [
    'warn',
    'We need more information first',
    'A public listing isn’t available yet. Here’s what to do next.',
  ],
  restricted: ['bad', 'This can’t be listed publicly', 'Ordinary rehoming listings are not offered for this species.'],
};

/** Guidance outcome (F-04) and handoff to the listing editor (F-06). Example rules, not legal or veterinary advice. */
export function GuidancePage() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const a = state.intake.answers;
  const g = state.intake.outcome || evaluateIntake(a);
  const s = SPECIES[a.speciesId] || {};
  const [tone, title, summary] = HEAD[g.outcome];
  const next = {
    eligible: [
      a.urgency === 'week'
        ? 'Short on time? Ask a local aquatic shop or fishkeeping club whether they take in rehomes while you wait for an adopter.'
        : 'Ask a local fishkeeping club to share your listing with members.',
      'Keep caring for it as normal until the handover is confirmed.',
    ],
    needs_review: [
      s.status === 'unknown'
        ? 'Ask a specialist aquatic shop to identify it, then answer the questions again.'
        : 'Wait until treatment has finished and it has been healthy for two weeks, then answer the questions again.',
      a.condition === 'unwell'
        ? 'Speak to a vet with fish experience about treatment.'
        : 'Take clear photos to help with identification.',
      'Keep it in its current tank or pond in the meantime.',
    ],
    restricted: [
      'Keep caring for it where it is now. Do not release it into ponds, rivers or drains.',
      'Contact a specialist rescue or your local authority for advice on what is allowed.',
      'Read the GOV.UK guidance on invasive non-native species.',
    ],
  }[g.outcome];
  const restart = (reset) => {
    update((d) => {
      if (reset) d.intake = freshIntake();
      else d.intake.step = 1;
    });
    navigate('/rehome');
  };

  return (
    <div className={page}>
      <div className={qwrap}>
        <div className="grid max-w-2xl gap-10">
          <div className="grid gap-2">
            <p className="text-md text-ink-2">
              Your rehoming guidance
              {s.common ? ` for ${a.quantity ? `${a.quantity} × ` : ''}${s.common.toLowerCase()}` : ''}
            </p>
            <Outcome tone={tone}>
              <div>
                <Chip status={g.outcome} />
              </div>
              <h1>{title}</h1>
              <p className="text-md">{summary}</p>
            </Outcome>
          </div>
          <section className="grid gap-3">
            <h2 className="text-lg">Why you’re seeing this</h2>
            <ul className={reasons}>
              {g.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
          <section className="grid gap-3">
            <h2 className="text-lg">{g.outcome === 'eligible' ? 'Also worth doing' : 'What you can do next'}</h2>
            <ul className={reasons}>
              {next.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {g.outcome === 'eligible' && (
                <Button data-tour="create-listing" onClick={() => navigate('/listings/new?from=intake')}>
                  Create my listing
                </Button>
              )}
              <Button variant="secondary" onClick={() => restart(false)}>
                Change my answers
              </Button>
              <Button variant="quiet" onClick={() => restart(true)}>
                Start again
              </Button>
            </div>
            {g.outcome === 'eligible' && !state.user && (
              <p className="text-ink-2 text-sm">
                You’ll be asked to sign in. Your answers are kept and used to fill in the listing.
              </p>
            )}
          </div>
          <Notice title="These are example rules">
            Sprint 1 uses illustrative rules. This is not a legal or veterinary decision.
          </Notice>
        </div>
        <aside className={cx(sticky, 'max-lg:hidden')}>
          <CareWidget speciesId={a.speciesId} />
        </aside>
      </div>
    </div>
  );
}
