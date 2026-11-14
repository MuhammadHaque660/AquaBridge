import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { byId, freshIntake, today } from '../../services/seed';
import { SPECIES, suggestTitle, supportedSpecies } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { ErrorSummary, Field } from '../../shared/components/Form';
import { useUi } from '../../shared/hooks';
import { cx, formFoot, formGrid, label, page, stack, sticky, twoPane } from '../../shared/styles';
import { CareWidget } from '../guidance/CareWidget';
import { ListingCard } from './ListingCard';
import { validateListing } from './validate';

/** Error keys map to these field IDs so the error summary links focus the right control. */
const FIELD_IDS = { title: 'title', qty: 'qty', location: 'loc', description: 'desc' };

/** A new listing, pre-filled from the guided questions when they were completed (F-06 → S-01). */
function draftFromIntake(intake, user, fromIntake) {
  const a = intake.answers;
  const s = SPECIES[a.speciesId] || {};
  return {
    id: null,
    owner: user,
    speciesId: a.speciesId || 'SP-001',
    title: fromIntake && s.common ? suggestTitle(s, a.quantity) : '',
    qty: +a.quantity || 1,
    location: a.location || '',
    condition: a.condition || 'healthy',
    urgency: a.urgency || 'month',
    status: 'draft',
    description: fromIntake
      ? [REASON[a.reason] ? `Reason for rehoming: ${REASON[a.reason].toLowerCase()}.` : '', a.details || '']
          .join(' ')
          .trim()
      : '',
    careNotes: a.health || '',
    intakeId: fromIntake ? intake.id : null,
    created: today(),
  };
}

/** Listing editor (S-01 create, S-04 edit). Requires login. */
export function EditorPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const ui = useUi();
  const { state, update, toast } = useStore();
  const navigate = useNavigate();
  const existing = id && byId(state.listings, id);
  const [d, setD] = useState(() => ({
    ...(existing ? { ...existing } : draftFromIntake(state.intake, state.user, search.get('from') === 'intake')),
    ...ui.draftPatch,
  }));
  const [errors, setErrors] = useState(ui.errors || {});

  if (id && !existing)
    return (
      <div className={page}>
        <Empty title="We could not find that listing.">
          <Button to="/account/listings" variant="secondary">
            Go to my listings
          </Button>
        </Empty>
      </div>
    );

  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const save = (status) => {
    const e =
      status === 'active' ? validateListing(d) : !d.title?.trim() ? { title: 'Add a title to save a draft.' } : {};
    setErrors(e);
    if (Object.keys(e).length) return;
    const wasActive = d.status === 'active';
    update((s) => {
      const clean = { ...d, title: d.title.trim(), location: d.location.trim(), description: d.description.trim() };
      if (!clean.id)
        s.listings.unshift({ ...clean, id: 'L-' + s.seq.listing++, owner: s.user, created: today(), status });
      else Object.assign(byId(s.listings, clean.id), { ...clean, status: wasActive ? 'active' : status });
      if (clean.intakeId) s.intake = freshIntake();
    });
    navigate('/account/listings');
    toast(
      status === 'active'
        ? wasActive
          ? 'Your changes have been saved'
          : 'Your listing is live. It now appears in Browse listings.'
        : 'Draft saved',
    );
  };

  return (
    <div className={page}>
      <PageHead
        title={d.id ? 'Edit your listing' : 'Create your listing'}
        crumb={<Link to="/account/listings">← Back to my listings</Link>}
      >
        {d.intakeId ? (
          <Notice
            tone="ok"
            title="We have filled this in from your answers"
            data-tour="prefill"
            className="max-w-[60ch]"
          >
            The species, how many, condition, location and timing come from the rehoming questions. Check them, then add
            a title and description.
          </Notice>
        ) : (
          <p className="text-md text-ink-2 max-w-[60ch]">
            Adopters see this information before they ask. Only your town and postcode district are shown.
          </p>
        )}
      </PageHead>
      <div className={twoPane}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save('active');
          }}
        >
          <ErrorSummary errors={errors} ids={FIELD_IDS} />
          <div className={formGrid}>
            <Field
              id="title"
              label="Title"
              full
              hint="Say what it is and how many, for example “Six neon tetras”. 10 to 80 characters."
              error={errors.title}
            >
              <input type="text" id="title" value={d.title} maxLength={80} onChange={set('title')} />
            </Field>
            <Field
              id="speciesId2"
              label="Species"
              hint={
                d.intakeId
                  ? 'This is the species you were given guidance for, so it cannot be changed here.'
                  : undefined
              }
            >
              <select id="speciesId2" value={d.speciesId} onChange={set('speciesId')} disabled={!!d.intakeId}>
                {supportedSpecies().map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.common}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="qty" label="How many" error={errors.qty}>
              <input
                type="number"
                id="qty"
                min="1"
                inputMode="numeric"
                className="max-w-32"
                value={d.qty}
                onChange={set('qty')}
              />
            </Field>
            <Field
              id="loc"
              label="Town and postcode district"
              hint="For example, Uxbridge, UB8"
              error={errors.location}
            >
              <input type="text" id="loc" value={d.location} onChange={set('location')} />
            </Field>
            <Field id="cond" label="Condition">
              <select id="cond" value={d.condition} onChange={set('condition')}>
                {Object.entries(CONDITION)
                  .filter(([k]) => k !== 'unwell')
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
              </select>
            </Field>
            <Field id="urg" label="When does it need a new home?">
              <select id="urg" value={d.urgency} onChange={set('urgency')}>
                {Object.entries(URGENCY).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id="desc"
              label="Description"
              full
              hint="Age, temperament and why you are rehoming. At least 40 characters."
              error={errors.description}
            >
              <textarea id="desc" value={d.description} onChange={set('description')} />
            </Field>
            <Field id="care" label="Care notes" optional full hint="Food, temperature and tank mates.">
              <textarea id="care" value={d.careNotes} onChange={set('careNotes')} />
            </Field>
          </div>
          <div className={formFoot}>
            <Button type="submit">{d.status === 'active' ? 'Save changes' : 'Publish listing'}</Button>
            <Button variant="secondary" onClick={() => save('draft')}>
              Save as draft
            </Button>
          </div>
        </form>
        <aside className={cx(stack, sticky)}>
          <h2 className={cx(label, 'text-sm')}>Preview: how adopters will see it</h2>
          <ListingCard listing={{ ...d, id: d.id || 'L-new' }} preview />
          <CareWidget speciesId={d.speciesId} />
        </aside>
      </div>
    </div>
  );
}
