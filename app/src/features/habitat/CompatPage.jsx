import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { to } from '../../routes';
import { USERS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { BackLink, Empty, PageHead } from '../../shared/components/Feedback';
import { Field } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import { cx, kv, page, row, stack, stackLg, sticky, twoPane } from '../../shared/styles';
import { Outcome } from '../guidance/GuidancePage';
import { ListingCard } from '../listings/ListingCard';
import { evaluateCompat } from './compat';
import { RangeBar } from './RangeBar';

const HEAD = {
  potential_match: [
    'ok',
    'Your tank or pond looks suitable',
    'It meets every rule we check for this listing. You can ask the owner to adopt.',
  ],
  needs_information: [
    'warn',
    'We need a few more details',
    'Some details are missing from this tank or pond. Add them to get a result.',
  ],
  blocked: [
    'bad',
    'This tank or pond is not suitable',
    'At least one essential condition is not met, so you cannot send a request for this listing.',
  ],
};
const VERDICT = {
  pass: ['ok', 'Meets'],
  fail: ['bad', 'Does not meet'],
  missing: ['warn', 'Missing'],
  advice: ['pri', 'Advice'],
};

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
        <Empty title="Choose a listing to check first.">
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
      <PageHead
        title="Check if your tank or pond is suitable"
        crumb={
          <BackLink
            href={to('listing', { id: l.id })}
            onClick={(e) => (e.preventDefault(), go('listing', { id: l.id }))}
          >
            Back to {l.title}
          </BackLink>
        }
      >
        We compare what this listing needs with one of your saved tanks or ponds, and explain each result.
      </PageHead>
      <div className={twoPane}>
        <div className={stackLg}>
          {!h ? (
            <Empty title="Add a tank or pond to run the check.">
              <Button size="sm" onClick={() => editHabitat('new')}>
                Add a tank or pond
              </Button>
            </Empty>
          ) : (
            <>
              <div className="grid gap-3">
                <Field id="habSel" label="Which tank or pond?" className="max-w-md">
                  <select id="habSel" value={h.id} onChange={(e) => setHabId(e.target.value)}>
                    {mine.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name} ({x.type})
                      </option>
                    ))}
                  </select>
                </Field>
                <div className={row}>
                  <Button variant="quiet" size="sm" onClick={() => editHabitat(h.id)}>
                    Edit {h.name}
                  </Button>
                  <Button variant="quiet" size="sm" onClick={() => editHabitat('new')}>
                    Add another tank or pond
                  </Button>
                </div>
              </div>

              <Outcome tone={HEAD[res.outcome][0]} data-tour="outcome">
                <Chip status={res.outcome} />
                <h2>{HEAD[res.outcome][1]}</h2>
                <p>{HEAD[res.outcome][2]}</p>
                <div className={cx(row, 'mt-2')}>
                  {res.outcome === 'potential_match' && (
                    <Button to={to('request', { id: l.id, hab: h.id })}>
                      Ask {USERS[l.owner].short.split(' ')[0]} to adopt
                    </Button>
                  )}
                  {res.outcome === 'needs_information' && (
                    <Button onClick={() => editHabitat(h.id)}>Add the missing details</Button>
                  )}
                  {res.outcome === 'blocked' && (
                    <Button variant="secondary" to="/browse">
                      Browse other listings
                    </Button>
                  )}
                </div>
              </Outcome>

              <section className={stack} aria-labelledby="checked">
                <h2 id="checked" className="text-xl">
                  What we checked
                </h2>
                <ul className="border-line m-0 grid list-none border-t p-0" data-tour="checks">
                  {res.checks.map((c) => (
                    <li key={c.label} className="border-line grid gap-1.5 border-b py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Chip tone={VERDICT[c.status][0]}>{VERDICT[c.status][1]}</Chip>
                        <h3 className="text-md font-semibold">{c.label}</h3>
                      </div>
                      <p className="max-w-[60ch]">{c.detail}</p>
                      {c.bar && (
                        <div className="mt-1 grid gap-1">
                          <RangeBar bar={c.bar} />
                          <p className="text-ink-2 text-xs">
                            Shaded: what {s.common.toLowerCase()} need. Solid: your {h.type}.
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {res.outcome !== 'potential_match' && (
                  <p>
                    <Link to="/browse">Browse other listings</Link>
                  </p>
                )}
                <p className="text-ink-2 text-sm">
                  These are example rules for the prototype. A match is a guide, not a guarantee that a species will
                  thrive.
                </p>
              </section>
            </>
          )}
        </div>
        <aside className={cx(stack, sticky)} aria-label="Listing">
          <ListingCard listing={l} />
          <div className="grid gap-2">
            <h2 className="text-lg">What {s.common.toLowerCase()} need</h2>
            <dl className={kv}>
              <dt>Temperature</dt>
              <dd>
                {s.temp[0]} to {s.temp[1]} °C
              </dd>
              <dt>pH</dt>
              <dd>
                {s.ph[0].toFixed(1)} to {s.ph[1].toFixed(1)}
              </dd>
              <dt>Minimum volume</dt>
              <dd>{s.minVol} litres</dd>
              <dt>Lives in</dt>
              <dd>{s.habitats.map((x) => (x === 'pond' ? 'Pond' : 'Aquarium')).join(' or ')}</dd>
              {s.minDepth && (
                <>
                  <dt>Minimum depth</dt>
                  <dd>{s.minDepth} cm</dd>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
