import { useState } from 'react';
import { useStore } from '../../services/store';
import { speciesFor } from '../../services/species';
import { Button } from '../../shared/components/Button';
import { Empty, PageHead } from '../../shared/components/Feedback';
import { Field, Segmented } from '../../shared/components/Form';
import { page, toolbar } from '../../shared/styles';
import { cardGrid, ListingCard } from './ListingCard';

/** Browse listings (S-02). Public. Only active listings are shown. */
export function BrowsePage() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const [hab, setHab] = useState('any');
  const active = state.listings.filter((l) => l.status === 'active');
  const term = q.trim().toLowerCase();
  const list = active.filter((l) => {
    const s = speciesFor(l);
    if (kind !== 'all' && s.kind !== kind) return false;
    if (hab !== 'any' && !(s.habitats || []).includes(hab)) return false;
    if (term && !`${l.title} ${s.common} ${s.sci} ${l.location}`.toLowerCase().includes(term)) return false;
    return true;
  });
  const clear = () => {
    setQ('');
    setKind('all');
    setHab('any');
  };
  return (
    <div className={page}>
      <PageHead title="Available listings">
        Every listing has passed the guided questions. Open one to read its care needs and check it against your tank or
        pond.
      </PageHead>
      <div className={toolbar}>
        <Field id="q" label="Search species or town" className="flex-[1_1_200px]">
          <input
            type="text"
            id="q"
            value={q}
            placeholder="e.g. tetra, Uxbridge"
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <div className="grid gap-1.5">
          <span className="text-sm font-bold">Type</span>
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              ['all', 'All'],
              ['animal', 'Animals'],
              ['plant', 'Plants'],
            ]}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="text-sm font-bold">Lives in</span>
          <Segmented
            value={hab}
            onChange={setHab}
            options={[
              ['any', 'Any'],
              ['aquarium', 'Aquarium'],
              ['pond', 'Pond'],
            ]}
          />
        </div>
      </div>
      <p className="text-ink-2 mb-4 text-sm" aria-live="polite">
        {list.length} of {active.length} listings
      </p>
      {list.length ? (
        <div className={cardGrid} data-tour="browse-grid">
          {list.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <Empty title="No listings match those filters.">
          <Button variant="secondary" size="sm" onClick={clear}>
            Clear filters
          </Button>
        </Empty>
      )}
    </div>
  );
}
