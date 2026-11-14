import { Link, useParams } from 'react-router';
import { to } from '../../routes';
import { CareList } from '../guidance/CareList';
import { CONDITION, URGENCY, USERS } from '../../services/contracts';
import { byId } from '../../services/seed';
import { speciesFor } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Empty } from '../../shared/components/Feedback';
import { SpeciesArt } from '../../shared/components/SpeciesArt';
import {
  box,
  cx,
  kv,
  page,
  readable,
  reasons,
  reasonsOl,
  row,
  stack,
  stackLg,
  sticky,
  twoPane,
} from '../../shared/styles';
import { town } from './validate';

const boxTitle = 'text-lg font-bold';

/** Listing details (S-03), with care data from the species catalogue (F-05). Public. */
export function ListingPage() {
  const { id } = useParams();
  const { state } = useStore();
  const l = byId(state.listings, id);
  if (!l)
    return (
      <div className={page}>
        <Empty title="We could not find that listing. It may have been rehomed or withdrawn.">
          <Button to="/browse" variant="secondary">
            Browse listings
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
  const pond = s.habitats?.length === 1 && s.habitats[0] === 'pond';
  const owner = USERS[l.owner]?.short || 'You';

  let action;
  if (mine)
    action = (
      <>
        <h2 className={boxTitle}>This is your listing</h2>
        <p className="text-ink-2 text-sm">Adopters see a “Check compatibility” button here.</p>
        <Button to="/account/listings">Manage my listings</Button>
      </>
    );
  else if (existing)
    action = (
      <>
        <h2 className={boxTitle}>You have asked to adopt these</h2>
        <div className={row}>
          <Chip status={existing.status} />
        </div>
        <p className="text-ink-2 text-sm">
          {existing.status === 'accepted'
            ? 'The owner has accepted. Confirm the handover in your adoption requests once you have collected them.'
            : 'The owner has not decided yet. You can follow or withdraw your request at any time.'}
        </p>
        <Button to="/account/requests">View my adoption requests</Button>
      </>
    );
  else if (l.status === 'active')
    action = (
      <>
        <h2 className={boxTitle}>Could you give them a home?</h2>
        <ol className={cx(reasonsOl, 'text-sm')}>
          <li>{myHabs ? `Choose one of your ${myHabs} saved tanks or ponds` : 'Tell us about your tank or pond'}.</li>
          <li>We compare it with the care needs for this species.</li>
          <li>If it is suitable, introduce yourself to {USERS[l.owner].name.split(' ')[0]}.</li>
        </ol>
        <Button to={to('compat', { id: l.id })} data-tour="check-compat">
          Check compatibility
        </Button>
        {!state.user && <p className="text-ink-2 text-sm">You will need to sign in first. Browsing is always free.</p>}
      </>
    );
  else
    action = (
      <>
        <h2 className={boxTitle}>Not taking requests</h2>
        <p className="text-ink-2 text-sm">
          This listing is {l.status === 'reserved' ? 'reserved for another adopter' : l.status}.
        </p>
        <Button to="/browse" variant="secondary">
          Browse other listings
        </Button>
      </>
    );

  return (
    <div className={page}>
      <p className="text-sm">
        <Link to="/browse">← Back to listings</Link>
      </p>
      <div className={cx(twoPane, 'mt-6')}>
        <div className={stackLg}>
          <div className="rounded-ab bg-mist aspect-[16/10] overflow-hidden">
            <SpeciesArt speciesId={l.speciesId} pond={pond} label={`Illustration of ${s.common.toLowerCase()}`} />
          </div>
          <div className="grid gap-3">
            <h1>{l.title}</h1>
            <p className="text-md text-ink-2">
              {town(l.location)} · Listed {l.created}
            </p>
            {(l.urgency === 'week' || l.status !== 'active') && (
              <div className={row}>
                {l.status !== 'active' && <Chip status={l.status} />}
                {l.urgency === 'week' && <Chip tone="warn">Needs a home this week</Chip>}
              </div>
            )}
            <p className={cx(readable, 'text-md mt-2')}>{l.description}</p>
          </div>
          <section className="grid gap-3">
            <h2 className="text-xl">About this listing</h2>
            <dl className={kv}>
              <dt>Species</dt>
              <dd>
                {s.common} <span className="text-ink-2 italic">({s.sci})</span>
              </dd>
              <dt>How many</dt>
              <dd>{l.qty}</dd>
              <dt>Condition</dt>
              <dd>{CONDITION[l.condition]}</dd>
              <dt>Location</dt>
              <dd>{l.location}</dd>
              <dt>Needs a home</dt>
              <dd>{URGENCY[l.urgency]}</dd>
              <dt>Listed by</dt>
              <dd>{owner}</dd>
            </dl>
          </section>
          {l.careNotes && (
            <section className="grid gap-2">
              <h2 className="text-xl">Notes from the owner</h2>
              <p className={readable}>{l.careNotes}</p>
            </section>
          )}
          <section className="grid gap-3">
            <h2 className="text-xl">Care needs</h2>
            <p className={readable}>{s.care}</p>
            <CareList species={s} />
            <p className="text-ink-2 text-sm">
              Care ranges are sample reference data and have not been checked by a specialist.
            </p>
          </section>
          {!mine && (
            <section className="grid gap-3">
              <h2 className="text-xl">Before you collect</h2>
              <ul className={cx(reasons, readable)}>
                <li>
                  Make sure your {s.habitats ? s.habitats.join(' or ') : 'setup'} is set up and stable before collection
                  {s.kind === 'animal' ? ', with the filter already cycled' : ''}.
                </li>
                <li>
                  You arrange collection with the owner after they accept. Bring{' '}
                  {s.kind === 'plant'
                    ? 'a damp bag or a tub with a little water'
                    : 'a sealed bag or insulated box with water from their tank'}
                  .
                </li>
                <li>
                  Only the town and postcode district are shown here. The owner shares the exact pickup point once they
                  accept.
                </li>
              </ul>
            </section>
          )}
        </div>
        <aside className={sticky}>
          <div className={cx(box, stack)}>{action}</div>
        </aside>
      </div>
    </div>
  );
}
