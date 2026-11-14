import { Link } from 'react-router';
import { to } from '../../routes';
import { useStore } from '../../services/store';
import { speciesFor } from '../../services/species';
import { Chip } from '../../shared/components/Chip';
import { SpeciesArt } from '../../shared/components/SpeciesArt';
import { town } from './validate';

/**
 * Listing card (S-02). Public thumbnail: picture, title, species, town and date, so people can decide whether to open it.
 * The whole card is clickable through the title link; care ranges and the owner live on the detail page.
 */
export function ListingCard({ listing: l, preview }) {
  const { state } = useStore();
  const s = speciesFor(l);
  const mine = state.user && l.owner === state.user;
  const tag = mine ? (
    <Chip tone="pri">Your listing</Chip>
  ) : l.urgency === 'week' ? (
    <Chip tone="warn">Needs a home soon</Chip>
  ) : null;
  const pond = s.habitats?.length === 1 && s.habitats[0] === 'pond';
  const title = l.title || 'Untitled listing';
  return (
    <article className="group relative flex flex-col gap-3" data-listing-id={preview ? undefined : l.id}>
      <div className="rounded-ab bg-mist relative aspect-[16/10] overflow-hidden">
        <SpeciesArt
          speciesId={l.speciesId}
          pond={pond}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {tag && <span className="absolute top-3 left-3">{tag}</span>}
      </div>
      <div className="grid gap-1">
        <h3 className="text-lg leading-snug">
          {preview ? (
            title
          ) : (
            <Link
              to={to('listing', { id: l.id })}
              className="text-ink hover:text-ink no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
            >
              {title}
            </Link>
          )}
        </h3>
        <p className="text-ink-2 text-sm">
          {s.common} · {l.qty > 1 ? `${l.qty} available` : '1 available'}
        </p>
        <p className="text-ink-2 text-sm">
          {town(l.location)} · Listed {l.created}
        </p>
      </div>
    </article>
  );
}

export const cardGrid = 'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-6 gap-y-10';
