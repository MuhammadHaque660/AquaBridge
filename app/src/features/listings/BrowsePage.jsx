import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useStore } from '../../services/store';
import { speciesFor } from '../../services/species';
import { Button } from '../../shared/components/Button';
import { Empty, PageHead } from '../../shared/components/Feedback';
import { RadioList } from '../../shared/components/Form';
import { cx, page } from '../../shared/styles';
import { cardGrid, ListingCard } from './ListingCard';

const URGENCY_ORDER = { week: 0, month: 1, flexible: 2 };

/** Browse listings (S-02). Public. Only active listings are shown. Filters sit in a sidebar, as on most marketplaces. */
export function BrowsePage() {
  const { state } = useStore();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [kind, setKind] = useState('all');
  const [hab, setHab] = useState('any');
  const [sort, setSort] = useState('newest');
  const active = state.listings.filter((l) => l.status === 'active');
  const term = q.trim().toLowerCase();
  const matches = (l, k = kind, h = hab) => {
    const s = speciesFor(l);
    if (k !== 'all' && s.kind !== k) return false;
    if (h !== 'any' && !(s.habitats || []).includes(h)) return false;
    if (term && !`${l.title} ${s.common} ${s.sci} ${l.location}`.toLowerCase().includes(term)) return false;
    return true;
  };
  const list = active.filter((l) => matches(l));
  if (sort === 'soonest') list.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
  const count = (k, h) => active.filter((l) => matches(l, k, h)).length;
  const filtered = kind !== 'all' || hab !== 'any' || term;
  const clear = () => {
    setQ('');
    setKind('all');
    setHab('any');
  };

  const filters = (prefix) => (
    <div className="grid gap-7">
      <RadioList
        name={`${prefix}kind`}
        legend="Type"
        value={kind}
        onChange={setKind}
        options={[
          ['all', 'All', count('all', hab)],
          ['animal', 'Animals', count('animal', hab)],
          ['plant', 'Plants', count('plant', hab)],
        ]}
      />
      <RadioList
        name={`${prefix}hab`}
        legend="Lives in"
        value={hab}
        onChange={setHab}
        options={[
          ['any', 'Aquarium or pond', count(kind, 'any')],
          ['aquarium', 'Aquarium', count(kind, 'aquarium')],
          ['pond', 'Pond', count(kind, 'pond')],
        ]}
      />
      {filtered && (
        <Button variant="quiet" size="sm" onClick={clear} className="justify-self-start">
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className={page}>
      <PageHead title="Animals and plants needing a home">
        Every listing has been through our guided questions. Open one to see its care needs and check it against your
        tank or pond.
      </PageHead>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-10 grid max-w-2xl gap-2">
        <label htmlFor="q" className="font-semibold">
          Search by species or town
        </label>
        <input
          type="search"
          id="q"
          value={q}
          placeholder="For example, tetra or Uxbridge"
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-12 max-lg:grid-cols-1 max-lg:gap-6">
        <aside aria-label="Filters">
          <h2 className="mb-5 text-lg max-lg:hidden">Filter</h2>
          <div className="max-lg:hidden">{filters('')}</div>
          <details className="rounded-ab border-line border lg:hidden">
            <summary className="min-h-11 cursor-pointer px-4 py-2.5 font-semibold">
              Filter listings{filtered ? ' (on)' : ''}
            </summary>
            <div className="border-line border-t p-4">{filters('m-')}</div>
          </details>
        </aside>

        <section aria-label="Results">
          <div className="border-line mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <p className="font-semibold" aria-live="polite">
              {list.length === active.length
                ? `${list.length} listings`
                : `${list.length} of ${active.length} listings`}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={cx('w-auto py-1.5 text-sm')}
              >
                <option value="newest">Newest first</option>
                <option value="soonest">Needs a home soonest</option>
              </select>
            </div>
          </div>
          {list.length ? (
            <div className={cardGrid} data-tour="browse-grid">
              {list.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <Empty title="No listings match your search.">
              <p className="text-ink-2">Try a different species or town, or clear the filters.</p>
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear search and filters
              </Button>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
