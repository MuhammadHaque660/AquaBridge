/** Public species guide (F-08, Farhan): a searchable list and a page per species. Reads only the species catalogue. */
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { to } from '../../routes';
import { SPECIES } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { BackLink, Empty, Notice, PageHead, Warning } from '../../shared/components/Feedback';
import { RadioList } from '../../shared/components/Form';
import { SpeciesArt } from '../../shared/components/SpeciesArt';
import { cx, page, readable } from '../../shared/styles';
import { cardGrid, ListingCard } from '../listings/ListingCard';
import { CareList } from './CareList';

const GUIDE = Object.entries(SPECIES)
  .filter(([, s]) => s.status !== 'unknown')
  .map(([id, s]) => ({ id, ...s }));
const isPond = (s) => s.habitats?.length === 1 && s.habitats[0] === 'pond';

export function SpeciesListPage() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const term = q.trim().toLowerCase();
  const list = GUIDE.filter(
    (s) => (kind === 'all' || s.kind === kind) && (!term || `${s.common} ${s.sci}`.toLowerCase().includes(term)),
  );
  const count = (k) => GUIDE.filter((s) => k === 'all' || s.kind === k).length;
  return (
    <div className={page}>
      <PageHead title="Species guide">
        Care needs for every animal and plant AquaBridge supports, and the species that cannot be listed. Use it before
        you rehome or adopt.
      </PageHead>
      <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-12 max-lg:grid-cols-1 max-lg:gap-6">
        <aside aria-label="Filters" className="grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="species-q" className="font-semibold">
              Search by name
            </label>
            <input
              id="species-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="For example, fern"
            />
          </div>
          <RadioList
            name="species-kind"
            legend="Type"
            value={kind}
            onChange={setKind}
            options={[
              ['all', 'All', count('all')],
              ['animal', 'Animals', count('animal')],
              ['plant', 'Plants', count('plant')],
            ]}
          />
        </aside>
        <section aria-label="Species">
          <p className="border-line mb-6 border-b pb-4 font-semibold" aria-live="polite">
            {list.length} {list.length === 1 ? 'species' : 'species'}
          </p>
          {list.length ? (
            <ul className={cx(cardGrid, 'm-0 list-none p-0')} data-tour="species-list">
              {list.map((s) => (
                <li key={s.id} className="group relative grid content-start gap-3">
                  <div className="rounded-ab bg-mist aspect-[16/10] overflow-hidden">
                    <SpeciesArt speciesId={s.id} pond={isPond(s)} />
                  </div>
                  <div className="grid gap-1">
                    <h2 className="text-lg leading-snug">
                      <Link
                        to={to('speciesDetail', { id: s.id })}
                        className="text-ink hover:text-ink no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
                      >
                        {s.common}
                      </Link>
                    </h2>
                    <p className="text-ink-2 text-sm">
                      <i>{s.sci}</i>
                    </p>
                    <p className="text-ink-2 text-sm">
                      {s.status === 'restricted' ? (
                        <Chip status="restricted">Restricted: cannot be listed</Chip>
                      ) : (
                        `${s.kind === 'plant' ? 'Plant' : 'Animal'} · ${s.habitats.join(' or ')}`
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No species match your search.">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQ('');
                  setKind('all');
                }}
              >
                Clear search
              </Button>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}

export function SpeciesPage() {
  const { id } = useParams();
  const { state } = useStore();
  const s = SPECIES[id];
  if (!s || s.status === 'unknown')
    return (
      <div className={page}>
        <h1 className="mb-4">Species not found</h1>
        <p>
          It may not be in our guide yet. <Link to="/species">See all species</Link>.
        </p>
      </div>
    );
  const listings = state.listings.filter((l) => l.speciesId === id && l.status === 'active');
  const restricted = s.status === 'restricted';
  return (
    <div className={page}>
      <BackLink to="/species">All species</BackLink>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] items-start gap-12 max-lg:grid-cols-1 max-lg:gap-8">
        <div className="grid gap-8">
          <div className="grid gap-2">
            <h1>{s.common}</h1>
            <p className="text-ink-2 text-lg">
              <i>{s.sci}</i> · {s.kind === 'plant' ? 'Plant' : 'Animal'}
            </p>
            {restricted && (
              <p>
                <Chip status="restricted">Restricted: cannot be listed</Chip>
              </p>
            )}
          </div>
          <div className="rounded-ab bg-mist aspect-[16/10] max-h-[380px] overflow-hidden">
            <SpeciesArt speciesId={id} pond={isPond(s)} label={`Illustration of ${s.common}`} />
          </div>
          <section className="grid gap-3" data-tour="species-care">
            <h2 className="text-xl">{restricted ? 'About this species' : 'Care needs'}</h2>
            <p className={readable}>{s.care}</p>
            <CareList species={s} />
            <p className="text-ink-2 text-sm">Sample reference data, not checked by a specialist.</p>
          </section>
          {restricted && (
            <section className="grid gap-3">
              <Warning>Do not release it into ponds, rivers or drains.</Warning>
              <p className={readable}>
                Keep caring for it where it is, and contact a specialist rescue or your local authority about what is
                allowed. <Link to="/how-it-works#never-release">What to do instead of releasing</Link>
              </p>
            </section>
          )}
        </div>
        <aside className="grid gap-6 lg:sticky lg:top-24">
          {restricted ? (
            <Notice tone="bad" title="This species cannot be listed">
              Ordinary rehoming listings are not offered for restricted species.
            </Notice>
          ) : (
            <div className="rounded-ab border-line grid gap-3 border p-6">
              <h2 className="text-lg">Have one to rehome?</h2>
              <p className="text-ink-2 text-sm">
                Answer a few questions and we will tell you whether it can be listed.
              </p>
              <Button to="/rehome" className="justify-self-start">
                Start rehoming
              </Button>
            </div>
          )}
        </aside>
      </div>
      {!restricted && (
        <section className="border-line mt-14 grid gap-6 border-t pt-10">
          <h2 className="text-xl">
            {listings.length
              ? `${listings.length} looking for a home now`
              : `No ${s.plural || s.common.toLowerCase()} listed right now`}
          </h2>
          {listings.length ? (
            <div className={cardGrid}>
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <p>
              <Link to="/browse">Browse all listings</Link>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
