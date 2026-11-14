import { Link, useParams } from 'react-router';
import { to } from '../../routes';
import { CONDITION, URGENCY, USERS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Empty } from '../../shared/components/Feedback';
import { Plate } from '../../shared/components/Plate';
import {
  careDl,
  crumb,
  cx,
  label,
  mono,
  page,
  panel,
  reasons,
  reasonsOl,
  row,
  stack,
  stackLg,
  sticky,
  twoPane,
} from '../../shared/styles';

const panelTitle = 'font-display text-lg font-bold';

/** Listing details (S-03), with care data from the species catalogue (F-05). Public. */
export function ListingPage() {
  const { id } = useParams();
  const { state } = useStore();
  const l = byId(state.listings, id);
  if (!l)
    return (
      <div className={page}>
        <Empty title="That listing could not be found.">
          <Button to="/browse" variant="secondary">
            Back to listings
          </Button>
        </Empty>
      </div>
    );
  const s = speciesFor(l);
  const mine = state.user && l.owner === state.user;
  const existing =
    state.user &&
    state.requests.find(
      (r) => r.listingId === l.id && r.adopter === state.user && ['pending', 'accepted'].includes(r.status),
    );
  const myHabs = state.user ? state.habitats.filter((h) => h.owner === state.user).length : 0;

  let action;
  if (mine)
    action = (
      <>
        <strong className={panelTitle}>This is your listing</strong>
        <p className="text-ink-2 text-sm">Adopters see a Check compatibility button here.</p>
        <Button to="/account/listings">Manage in My Listings</Button>
      </>
    );
  else if (existing)
    action = (
      <>
        <strong className={panelTitle}>You’ve asked for these</strong>
        <div className={row}>
          <Chip status={existing.status} />
          <span className={cx(mono, 'text-ink-2')}>{existing.id}</span>
        </div>
        <p className="text-ink-2 text-sm">
          {existing.status === 'accepted'
            ? 'The owner accepted. Confirm the handover in My Requests once you have them.'
            : 'The owner hasn’t decided yet. You can follow or withdraw it in My Requests.'}
        </p>
        <Button to="/account/requests">Go to My Requests</Button>
      </>
    );
  else if (l.status === 'active')
    action = (
      <>
        <strong className={panelTitle}>Could you give them a home?</strong>
        <ol className={cx(reasonsOl, 'text-sm')}>
          <li>{myHabs ? `Pick one of your ${myHabs} saved habitats` : 'Describe your tank or pond once'}.</li>
          <li>We compare it with the care needs below.</li>
          <li>If it’s a match, introduce yourself to {USERS[l.owner].short}.</li>
        </ol>
        <Button to={to('compat', { id: l.id })} data-tour="check-compat">
          Check compatibility
        </Button>
        {!state.user && (
          <p className="text-ink-2 text-sm">You’ll be asked to log in first. Looking around stays free.</p>
        )}
      </>
    );
  else
    action = (
      <>
        <strong>Not taking requests</strong>
        <p className="text-ink-2 text-sm">This listing is {l.status}.</p>
      </>
    );

  const facts = [
    ['Species', s.common],
    ['Quantity', l.qty],
    ['Condition', CONDITION[l.condition]],
    ['Location', l.location],
    ['Available', URGENCY[l.urgency]],
    ['Listed by', USERS[l.owner]?.short || 'You'],
  ];

  return (
    <div className={page}>
      <p className={crumb}>
        <Link to="/browse">← All listings</Link>
      </p>
      <div className={cx(twoPane, 'mt-4')}>
        <div className={stackLg}>
          <Plate species={s} detail />
          <div className={stack}>
            <div className={row}>
              <Chip status={l.status} />
              <span className={cx(mono, 'text-ink-2')}>{l.id}</span>
              {l.urgency === 'week' && (
                <Chip tone="warn" plain>
                  Needs a home this week
                </Chip>
              )}
            </div>
            <h1>{l.title}</h1>
            <p className="max-w-[65ch]">{l.description}</p>
          </div>
          <div className="rounded-ab border-line bg-line grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-hidden border">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-surface grid gap-0.5 px-4 py-3">
                <span className={label}>{k}</span>
                <b className="font-display text-[1.0625rem] font-semibold">{v}</b>
              </div>
            ))}
          </div>
          {l.careNotes && (
            <div className="grid gap-2">
              <h2 className="text-lg">Owner’s care notes</h2>
              <p className="max-w-[65ch]">{l.careNotes}</p>
            </div>
          )}
          {!mine && (
            <div className="grid gap-2">
              <h2 className="text-lg">Before you ask</h2>
              <ul className={reasons}>
                <li>
                  Make sure your {s.habitats ? s.habitats.join(' or ') : 'setup'} is set up and stable before collection
                  {s.kind === 'animal' ? ', with the filter already cycled' : ''}.
                </li>
                <li>
                  Collection is arranged with the owner after they accept. Bring{' '}
                  {s.kind === 'plant'
                    ? 'a damp bag or a tub with a little water'
                    : 'a sealed bag or insulated box with water from their tank'}
                  .
                </li>
                <li>
                  Only the town and postcode district are shown. The owner shares the exact pickup point once they
                  accept.
                </li>
              </ul>
            </div>
          )}
        </div>
        <aside className={cx(stack, sticky)}>
          <div className={cx(panel, stack)}>{action}</div>
          <div className={cx(panel, 'grid gap-3')}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3>Care needs</h3>
              <span className={label}>Species guide</span>
            </div>
            <p className="text-sm">
              <i>{s.sci}</i>
            </p>
            {s.temp && (
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
                    <dt>Planting depth</dt>
                    <dd>≥ {s.minDepth} cm</dd>
                  </>
                )}
                {s.light && (
                  <>
                    <dt>Light</dt>
                    <dd>{s.light}</dd>
                  </>
                )}
              </dl>
            )}
            <p className="text-sm">{s.care}</p>
            <p className="text-ink-2 text-sm">
              Care ranges are sample reference data and have not been verified by a specialist.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
