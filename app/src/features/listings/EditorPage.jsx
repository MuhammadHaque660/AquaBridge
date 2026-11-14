import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { byId, freshIntake, today } from '../../services/seed';
import { SPECIES, supportedSpecies } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { Field } from '../../shared/components/Form';
import { focusFirstError, useUi } from '../../shared/hooks';
import { cx, formFoot, formGrid, label, mono, page, panel, stack, sticky, twoPane } from '../../shared/styles';
import { CareWidget } from '../guidance/CareWidget';
import { ListingCard } from './ListingCard';
import { validateListing } from './validate';

/** A new listing, pre-filled from the guided questions when they were completed (F-06 → S-01). */
function draftFromIntake(intake, user, fromIntake) {
  const a = intake.answers;
  const s = SPECIES[a.speciesId] || {};
  return {
    id: null,
    owner: user,
    speciesId: a.speciesId || 'SP-001',
    title: fromIntake ? `${a.quantity} ${s.common?.toLowerCase()} need a new home` : '',
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
        <Empty title="That listing could not be found.">
          <Button to="/account/listings" variant="secondary">
            Back to My Listings
          </Button>
        </Empty>
      </div>
    );

  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const save = (status) => {
    const e =
      status === 'active' ? validateListing(d) : !d.title?.trim() ? { title: 'Add a title to save a draft.' } : {};
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    const wasActive = d.status === 'active';
    update((s) => {
      const clean = { ...d, title: d.title.trim(), location: d.location.trim(), description: d.description.trim() };
      if (!clean.id)
        s.listings.unshift({ ...clean, id: 'L-' + s.seq.listing++, owner: s.user, created: today(), status });
      else Object.assign(byId(s.listings, clean.id), { ...clean, status: wasActive ? 'active' : status });
      if (clean.intakeId) s.intake = freshIntake();
    });
    navigate('/account/listings');
    toast(status === 'active' ? (wasActive ? 'Changes saved' : 'Published. It now appears in Browse.') : 'Draft saved');
  };
  const errorCount = Object.keys(errors).length;

  return (
    <div className={page}>
      <PageHead
        title={d.id ? 'Edit listing' : 'Create your listing'}
        crumb={<Link to="/account/listings">← My Listings</Link>}
      >
        {d.intakeId && (
          <Notice tone="ok" title="Filled in from your rehoming answers" data-tour="prefill">
            Species, quantity, condition, location and timing came from intake{' '}
            <span className={mono}>{d.intakeId}</span>. Check them and add a description.
          </Notice>
        )}
      </PageHead>
      <div className={twoPane}>
        <form
          className={cx(panel, stack)}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save('active');
          }}
        >
          <div className={formGrid}>
            <Field
              id="title"
              label="Title"
              required
              full
              hint="10–80 characters. Say what it is and how many."
              error={errors.title}
            >
              <input type="text" id="title" value={d.title} maxLength={80} onChange={set('title')} />
            </Field>
            <Field
              id="speciesId2"
              label="Species"
              hint={d.intakeId ? 'Locked to the species checked in your guidance.' : undefined}
            >
              <select id="speciesId2" value={d.speciesId} onChange={set('speciesId')} disabled={!!d.intakeId}>
                {supportedSpecies().map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.common}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="qty" label="Quantity" required error={errors.qty}>
              <input type="number" id="qty" min="1" value={d.qty} onChange={set('qty')} />
            </Field>
            <Field id="loc" label="Location" required error={errors.location}>
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
            <Field id="urg" label="Available">
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
              required
              full
              hint="At least 40 characters. Age, temperament and why you’re rehoming."
              error={errors.description}
            >
              <textarea id="desc" value={d.description} onChange={set('description')} />
            </Field>
            <Field id="care" label="Care notes" full>
              <textarea
                id="care"
                value={d.careNotes}
                onChange={set('careNotes')}
                placeholder="Food, temperature, tank mates"
              />
            </Field>
          </div>
          {errorCount > 0 && (
            <Notice
              tone="bad"
              role="alert"
              title={`Fix ${errorCount} thing${errorCount > 1 ? 's' : ''} before publishing`}
            />
          )}
          <div className={cx(formFoot, 'mt-0')}>
            <Button variant="secondary" onClick={() => save('draft')}>
              Save as draft
            </Button>
            <Button type="submit">{d.status === 'active' ? 'Save changes' : 'Publish listing'}</Button>
          </div>
        </form>
        <aside className={cx(stack, sticky)}>
          <span className={label}>Preview · how adopters see it</span>
          <ListingCard listing={{ ...d, id: d.id || 'L-new' }} preview />
          <CareWidget speciesId={d.speciesId} />
        </aside>
      </div>
    </div>
  );
}
