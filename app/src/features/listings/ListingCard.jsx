import { Link } from 'react-router';
import { to } from '../../routes';
import { useStore } from '../../services/store';
import { speciesFor } from '../../services/species';
import { Chip } from '../../shared/components/Chip';
import { Plate } from '../../shared/components/Plate';
import { town } from './validate';

const CARD =
  'flex flex-col overflow-hidden rounded-ab border border-line bg-surface text-ink no-underline transition hover:border-primary hover:text-ink motion-safe:hover:-translate-y-0.5';

/**
 * Listing card (S-02). Public thumbnail: just enough to decide whether to open it.
 * Care ranges, quantity, condition and IDs live on the detail page.
 */
export function ListingCard({ listing: l, preview }) {
  const { state } = useStore();
  const s = speciesFor(l);
  const mine = state.user && l.owner === state.user;
  const tag = mine ? (
    <Chip tone="pri" plain>
      Your listing
    </Chip>
  ) : l.urgency === 'week' ? (
    <Chip tone="warn" plain>
      Needs a home soon
    </Chip>
  ) : null;
  const body = (
    <>
      <Plate species={s} />
      <div className="grid flex-1 content-start gap-2 p-4">
        <h3 className="text-[1.125rem]">{l.title || 'Untitled listing'}</h3>
        <p className="text-ink-2 text-sm">
          {s.kind === 'plant' ? 'Plant' : 'Animal'} · {town(l.location)}
        </p>
      </div>
      <div className="border-line text-ink-2 flex items-center justify-between gap-2 border-t px-4 py-3 text-xs">
        <span>Listed {l.created}</span>
        {tag}
      </div>
    </>
  );
  if (preview) return <div className={CARD}>{body}</div>;
  return (
    <Link to={to('listing', { id: l.id })} className={CARD} data-listing-id={l.id}>
      {body}
    </Link>
  );
}

export const cardGrid = 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6';
