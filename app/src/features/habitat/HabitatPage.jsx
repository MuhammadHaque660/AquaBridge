import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { to } from '../../routes';
import { byId } from '../../services/seed';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Empty, PageHead } from '../../shared/components/Feedback';
import { Choice, Field } from '../../shared/components/Form';
import { focusFirstError, useGo, useUi } from '../../shared/hooks';
import { choices, cx, formFoot, formGrid, mono, page, panel, stack } from '../../shared/styles';
import { missingCount, normaliseHabitat, validateHabitat } from './compat';
import { HabitatSummary } from './HabitatSummary';

const BLANK = {
  id: null,
  name: '',
  type: 'aquarium',
  volume: '',
  tempMin: '',
  tempMax: '',
  ph: '',
  filter: '',
  cycled: '',
  depth: '',
  light: 'medium',
  inhabitants: '',
};

/** Habitat profile form (M-01). Opened from My Habitat or from a compatibility check (then saving returns there). */
function HabitatForm({ edit }) {
  const { state, update, toast } = useStore();
  const navigate = useNavigate();
  const go = useGo();
  const ui = useUi();
  const existing = edit !== 'new' && byId(state.habitats, edit);
  const [h, setH] = useState(() => ({ ...(existing || { ...BLANK, owner: state.user }), ...ui.hDraftPatch }));
  const [errors, setErrors] = useState({});
  const back = state.returnTo;

  if (edit !== 'new' && !existing)
    return (
      <div className={page}>
        <Empty title="That habitat could not be found.">
          <Button to="/account/habitat" variant="secondary">
            Back to My Habitat
          </Button>
        </Empty>
      </div>
    );

  const set = (k) => (e) => setH({ ...h, [k]: e.target.value });
  const cancel = () => {
    if (back) {
      update((s) => {
        s.returnTo = null;
      });
      navigate(to('compat', { id: back }));
    } else navigate('/account/habitat');
  };
  const submit = (e) => {
    e.preventDefault();
    const d = normaliseHabitat({ ...h, name: h.name.trim(), inhabitants: h.inhabitants.trim() });
    const err = validateHabitat(d);
    setErrors(err);
    if (Object.keys(err).length) return focusFirstError();
    const id = update((s) => {
      if (!d.id) {
        d.id = 'H-' + s.seq.habitat++;
        s.habitats.push(d);
      } else Object.assign(byId(s.habitats, d.id), d);
      s.returnTo = null;
      return d.id;
    });
    toast('Habitat saved');
    if (back) go('compat', { id: back }, { hab: id });
    else navigate('/account/habitat');
  };
  const yn = (name, title, opts) => (
    <Field id={name} label={title}>
      <select id={name} value={h[name]} onChange={set(name)}>
        <option value="">Not sure / not set</option>
        {opts.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </Field>
  );
  const phField = (
    <Field id="ph" label="pH" error={errors.ph}>
      <input type="number" id="ph" step="0.1" value={h.ph} onChange={set('ph')} data-tour="habitat-ph" />
    </Field>
  );
  const crumbLink = (
    <Link
      to="/account/habitat"
      onClick={(e) => {
        e.preventDefault();
        cancel();
      }}
    >
      ← My Habitat
    </Link>
  );

  return (
    <div className={cx(page, 'max-w-[820px]')}>
      <PageHead title={h.id ? 'Edit habitat' : 'Add a habitat'} crumb={crumbLink}>
        Fill in what you know. Gaps are fine; the compatibility check will tell you what’s missing.
      </PageHead>
      <form className={cx(panel, stack)} noValidate onSubmit={submit}>
        <div className={formGrid}>
          <Field id="hname" label="Name" required full hint="Only you see this name." error={errors.name}>
            <input type="text" id="hname" value={h.name} onChange={set('name')} placeholder="e.g. Living room tank" />
          </Field>
          <Field legend="Type" full>
            <div className={choices}>
              <Choice
                name="type"
                value="aquarium"
                checked={h.type === 'aquarium'}
                onChange={(v) => setH({ ...h, type: v })}
                title="Aquarium"
                sub="Indoor tank"
              />
              <Choice
                name="type"
                value="pond"
                checked={h.type === 'pond'}
                onChange={(v) => setH({ ...h, type: v })}
                title="Pond"
                sub="Outdoor pond"
              />
            </div>
          </Field>
          <Field id="volume" label="Volume (litres)" error={errors.volume}>
            <input type="number" id="volume" min="5" value={h.volume} onChange={set('volume')} />
          </Field>
          {h.type === 'pond' ? (
            <Field id="depth" label="Deepest point (cm)">
              <input type="number" id="depth" value={h.depth} onChange={set('depth')} />
            </Field>
          ) : (
            phField
          )}
          <Field id="tempMin" label="Lowest temperature (°C)" error={errors.tempMin}>
            <input type="number" id="tempMin" value={h.tempMin} onChange={set('tempMin')} />
          </Field>
          <Field id="tempMax" label="Highest temperature (°C)" error={errors.tempMax}>
            <input type="number" id="tempMax" value={h.tempMax} onChange={set('tempMax')} />
          </Field>
          {h.type === 'pond' && phField}
          {yn('filter', 'Filter running?', [
            ['yes', 'Yes'],
            ['no', 'No'],
          ])}
          {yn('cycled', 'Filter cycled?', [
            ['yes', 'Yes'],
            ['no', 'No'],
            ['unsure', 'Not sure'],
          ])}
          <Field id="light" label="Lighting">
            <select id="light" value={h.light} onChange={set('light')}>
              {['low', 'medium', 'high'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field id="inh" label="What already lives there?" full>
            <input
              type="text"
              id="inh"
              value={h.inhabitants}
              onChange={set('inhabitants')}
              placeholder="e.g. 6 rasboras, 2 snails"
            />
          </Field>
        </div>
        <div className={cx(formFoot, 'mt-0')}>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          <Button type="submit">Save habitat{back ? ' and return to check' : ''}</Button>
        </div>
      </form>
    </div>
  );
}

/** My Habitat (M-02): saved tanks and ponds, reused across compatibility checks. Requires login. */
export function HabitatPage() {
  const { edit } = useParams();
  const { state, update } = useStore();
  const go = useGo();
  if (edit) return <HabitatForm edit={edit} />;
  const mine = state.habitats.filter((h) => h.owner === state.user);
  const add = () => {
    update((s) => {
      s.returnTo = null;
    });
    go('habitat', { edit: 'new' });
  };
  return (
    <div className={page}>
      <PageHead title="My Habitat" actions={<Button onClick={add}>Add a habitat</Button>}>
        Save each tank or pond once and reuse it whenever you check a listing.
      </PageHead>
      {mine.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {mine.map((h) => {
            const missing = missingCount(h);
            return (
              <article key={h.id} className="rounded-ab border-line bg-surface grid gap-3 border px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3>{h.name}</h3>
                  <span className={cx(mono, 'text-ink-2')}>{h.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Chip tone="pri" plain>
                    {h.type}
                  </Chip>
                  {missing ? (
                    <Chip tone="warn">{`${missing} detail${missing > 1 ? 's' : ''} missing`}</Chip>
                  ) : (
                    <Chip tone="ok">complete</Chip>
                  )}
                </div>
                <HabitatSummary habitat={h} />
                <div>
                  <Button variant="secondary" size="sm" onClick={() => go('habitat', { edit: h.id })}>
                    Edit
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="No habitats yet.">
          <Button size="sm" onClick={add}>
            Add your first habitat
          </Button>
        </Empty>
      )}
    </div>
  );
}
