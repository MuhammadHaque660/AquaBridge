import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { to } from '../../routes';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Empty, PageHead } from '../../shared/components/Feedback';
import { Field } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import {
  careDl,
  cx,
  label,
  mono,
  page,
  panel,
  row,
  stack,
  stackLg,
  sticky,
  toolbar,
  twoPane,
} from '../../shared/styles';
import { Outcome } from '../guidance/GuidancePage';
import { ListingCard } from '../listings/ListingCard';
import { evaluateCompat } from './compat';
import { RangeBar } from './RangeBar';

const HEAD = {
  potential_match: ['ok', 'Potential match', 'Your habitat meets every supported rule for this listing.'],
  needs_information: [
    'warn',
    'More information needed',
    'Some details are missing from your habitat. Add them to get a result.',
  ],
  blocked: ['bad', 'Not compatible', 'At least one essential condition isn’t met, so a request can’t be sent.'],
};
const ICON = { pass: '✓', fail: '✕', missing: '?', advice: 'i' };
const ICON_TONE = {
  pass: 'bg-ok-soft text-ok',
  fail: 'bg-bad-soft text-bad',
  missing: 'bg-warn-soft text-warn',
  advice: 'bg-primary-soft text-primary',
};
const STATUS_LABEL = { pass: 'Met', fail: 'Not met', missing: 'Missing', advice: 'Advice' };

/** Compatibility check (M-03 page, M-04 outcome rules). Requires login. */
export function CompatPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const ui = useUi();
  const { state, update } = useStore();
  const go = useGo();
  const l = byId(state.listings, id);
  const mine = state.habitats.filter((h) => h.owner === state.user);
  const [habId, setHabId] = useState(ui.hab || search.get('hab') || mine[0]?.id);

  if (!l)
    return (
      <div className={page}>
        <Empty title="Choose a listing first.">
          <Button to="/browse" variant="secondary">
            Browse listings
          </Button>
        </Empty>
      </div>
    );

  const s = speciesFor(l);
  const h = byId(state.habitats, habId) || mine[0];
  const res = h ? evaluateCompat(l, h) : null;
  const editHabitat = (edit) => {
    update((d) => {
      d.returnTo = l.id;
    });
    go('habitat', { edit });
  };

  return (
    <div className={page}>
      <p className="text-sm [&_a]:no-underline">
        <Link to={to('listing', { id: l.id })}>← {l.title}</Link>
      </p>
      <PageHead title="Check compatibility" className="mt-3">
        We compare the listing’s care needs with your saved habitat and explain each result.
      </PageHead>
      <div className={twoPane}>
        <div className={stackLg}>
          {!h ? (
            <Empty title="Add a habitat to run the check.">
              <Button size="sm" onClick={() => editHabitat('new')}>
                Add a habitat
              </Button>
            </Empty>
          ) : (
            <>
              <div className={cx(toolbar, 'mb-0')}>
                <Field id="habSel" label="Compare with" className="flex-[1_1_200px]">
                  <select id="habSel" value={h.id} onChange={(e) => setHabId(e.target.value)}>
                    {mine.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name} ({x.type})
                      </option>
                    ))}
                  </select>
                </Field>
                <Button variant="secondary" onClick={() => editHabitat(h.id)}>
                  Edit this habitat
                </Button>
                <Button variant="quiet" onClick={() => editHabitat('new')}>
                  Add another
                </Button>
              </div>
              <Outcome tone={HEAD[res.outcome][0]} data-tour="outcome">
                <div className={row}>
                  <Chip status={res.outcome} />
                  <span className={cx(mono, 'text-ink-2')}>
                    {l.id} × {h.id}
                  </span>
                </div>
                <h2 className="text-2xl">{HEAD[res.outcome][1]}</h2>
                <p className="text-ink-2">{HEAD[res.outcome][2]}</p>
              </Outcome>
              <section className={stack}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3>What we checked</h3>
                  <div className="text-ink-2 flex flex-wrap gap-4 text-xs">
                    <span>
                      <i className="border-primary bg-primary-soft mr-1.5 inline-block h-2 w-3.5 rounded-[2px] border align-middle" />
                      Species range
                    </span>
                    <span>
                      <i className="bg-ok mr-1.5 inline-block h-2 w-3.5 rounded-[2px] align-middle" />
                      Your habitat
                    </span>
                  </div>
                </div>
                <div className="rounded-ab border-line bg-surface grid border" data-tour="checks">
                  {res.checks.map((c, i) => (
                    <div
                      key={c.label}
                      className={cx(
                        'grid grid-cols-[26px_minmax(0,1fr)_auto] items-start gap-3 p-4',
                        i > 0 && 'border-line border-t',
                      )}
                    >
                      <span
                        className={cx(
                          'grid size-[22px] place-items-center rounded-full text-[0.8125rem] font-bold',
                          ICON_TONE[c.status],
                        )}
                        aria-hidden="true"
                      >
                        {ICON[c.status]}
                      </span>
                      <div className="grid min-w-0 gap-1.5">
                        <b className="font-display font-semibold">{c.label}</b>
                        <span className="text-sm">{c.detail}</span>
                        {c.bar && <RangeBar bar={c.bar} />}
                      </div>
                      <span className={label}>{STATUS_LABEL[c.status]}</span>
                    </div>
                  ))}
                </div>
              </section>
              <div className={row}>
                {res.outcome === 'potential_match' && (
                  <Button to={to('request', { id: l.id, hab: h.id })}>Request adoption</Button>
                )}
                {res.outcome === 'needs_information' && (
                  <Button onClick={() => editHabitat(h.id)}>Add missing details</Button>
                )}
                {res.outcome === 'blocked' && (
                  <>
                    <Button disabled aria-describedby="blk">
                      Request adoption
                    </Button>
                    <span className="text-ink-2 text-sm" id="blk">
                      Requests are blocked when an essential rule fails.
                    </span>
                  </>
                )}
                <Button variant="quiet" to="/browse">
                  Browse other listings
                </Button>
              </div>
              <p className="text-ink-2 text-sm">
                Example rules for Sprint 1. A match is a guide, not a guarantee that a species will thrive.
              </p>
            </>
          )}
        </div>
        <aside className={cx(stack, sticky)}>
          <ListingCard listing={l} />
          <div className={cx(panel, 'grid gap-3')}>
            <h3>Care needs</h3>
            <dl className={careDl}>
              <dt>Temperature</dt>
              <dd>
                {s.temp[0]}–{s.temp[1]} °C
              </dd>
              <dt>pH</dt>
              <dd>
                {s.ph[0].toFixed(1)}–{s.ph[1].toFixed(1)}
              </dd>
              <dt>Minimum volume</dt>
              <dd>{s.minVol} L</dd>
              <dt>Habitat</dt>
              <dd>{s.habitats.join(', ')}</dd>
              {s.minDepth && (
                <>
                  <dt>Depth</dt>
                  <dd>≥ {s.minDepth} cm</dd>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
