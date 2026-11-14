import { useNavigate } from 'react-router';
import { freshIntake } from '../../services/seed';
import { SPECIES } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Notice, PageHead } from '../../shared/components/Feedback';
import { cx, mono, page, reasons, row, stack, stackLg, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { qwrap } from './RehomePage';
import { evaluateIntake } from './rules';

const EDGE = { ok: 'before:bg-ok', warn: 'before:bg-warn', bad: 'before:bg-bad' };

/** Coloured-edge outcome card, shared by guidance (F-04) and compatibility (M-04). */
export function Outcome({ tone, children, ...rest }) {
  return (
    <section
      className={cx(
        "rounded-ab border-line bg-surface grid grid-cols-[6px_1fr] overflow-hidden border before:content-['']",
        EDGE[tone],
      )}
      {...rest}
    >
      <div className="grid gap-3 p-6">{children}</div>
    </section>
  );
}

const HEAD = {
  eligible: ['ok', 'You can create a listing', 'Your answers fit our guidance for a public listing.'],
  needs_review: [
    'warn',
    'We need more information first',
    'A public listing isn’t available yet. Here is what to do next.',
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
  const alt = {
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
  const restart = (step, reset) => {
    update((d) => {
      if (reset) d.intake = freshIntake();
      else d.intake.step = step;
    });
    navigate('/rehome');
  };

  return (
    <div className={page}>
      <PageHead eyebrow="Example outcome · Sprint 1 sample rules" title="Your rehoming guidance" />
      <div className={qwrap}>
        <div className={stackLg}>
          <Outcome tone={tone}>
            <div className={row}>
              <Chip status={g.outcome} />
              <span className={cx(mono, 'text-ink-2')}>
                {s.common || ''} × {a.quantity}
              </span>
            </div>
            <h2 className="text-2xl">{title}</h2>
            <p className="text-ink-2">{summary}</p>
            <h3 className="text-md mt-2">Why you’re seeing this</h3>
            <ul className={reasons}>
              {g.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Outcome>
          <section className={stack}>
            <h3>{g.outcome === 'eligible' ? 'Also worth doing' : 'What you can do instead'}</h3>
            <ul className={reasons}>
              {alt.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <div className={row}>
            {g.outcome === 'eligible' && (
              <Button data-tour="create-listing" onClick={() => navigate('/listings/new?from=intake')}>
                Create my listing
              </Button>
            )}
            <Button variant="secondary" onClick={() => restart(1)}>
              Change my answers
            </Button>
            <Button variant="quiet" onClick={() => restart(1, true)}>
              Start again
            </Button>
          </div>
          {g.outcome === 'eligible' && !state.user && (
            <p className="text-ink-2 text-sm">
              You’ll be asked to sign in. Your answers will be kept and used to fill in the listing.
            </p>
          )}
          <Notice title="Illustrative only">
            Sprint 1 uses example rules. This is not a legal or veterinary decision.
          </Notice>
        </div>
        <aside className={sticky}>
          <CareWidget speciesId={a.speciesId} />
        </aside>
      </div>
    </div>
  );
}
