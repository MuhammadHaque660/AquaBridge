import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { to } from '../../routes';
import { byId } from '../../services/seed';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { BackLink, Empty, PageHead } from '../../shared/components/Feedback';
import { Choice, ErrorSummary, Field } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import { choices, cx, formFoot, formGrid, page, panel } from '../../shared/styles';
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
const ERROR_IDS = { name: 'hname' };

/** Habitat profile form (M-01). Opened from My tanks and ponds or from a compatibility check (then saving returns there). */
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
        <Empty title="We could not find that tank or pond.">
          <Button to="/account/habitat" variant="secondary">
            Go to my tanks and ponds
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
    if (Object.keys(err).length) return;
    const id = update((s) => {
      if (!d.id) {
        d.id = 'H-' + s.seq.habitat++;
        s.habitats.push(d);
      } else Object.assign(byId(s.habitats, d.id), d);
      s.returnTo = null;
      return d.id;
    });
    toast(`${d.name} saved`);
    if (back) go('compat', { id: back }, { hab: id });
    else navigate('/account/habitat');
  };
  const yn = (name, title, opts) => (
    <Field id={name} label={title} optional>
      <select id={name} value={h[name]} onChange={set(name)}>
        <option value="">Not sure</option>
        {opts.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </Field>
  );
  const phField = (
    <Field
      id="ph"
      label="pH"
      optional
      hint="Usually between 6 and 8. A liquid test kit is more reliable than strips."
      error={errors.ph}
    >
      <input
        type="number"
        id="ph"
        step="0.1"
        inputMode="decimal"
        value={h.ph}
        onChange={set('ph')}
        data-tour="habitat-ph"
        className="max-w-40"
      />
    </Field>
  );

  return (
    <div className={cx(page, 'max-w-3xl')}>
      <PageHead
        title={h.id ? `Edit ${existing?.name || 'tank or pond'}` : 'Add a tank or pond'}
        crumb={
          <BackLink
            href="/account/habitat"
            onClick={(e) => {
              e.preventDefault();
              cancel();
            }}
          >
            {back ? 'Back to the compatibility check' : 'Back to my tanks and ponds'}
          </BackLink>
        }
      >
        Fill in what you know. You can leave gaps; the compatibility check tells you what is missing.
      </PageHead>
      <ErrorSummary errors={errors} ids={ERROR_IDS} />
      <form noValidate onSubmit={submit} className="grid gap-8">
        <Field id="hname" label="Name" hint="Only you see this, for example “Living room tank”." error={errors.name}>
          <input type="text" id="hname" value={h.name} onChange={set('name')} className="max-w-md" />
        </Field>
        <Field legend="Is it an aquarium or a pond?">
          <div className={choices}>
            <Choice
              name="type"
              value="aquarium"
              checked={h.type === 'aquarium'}
              onChange={(v) => setH({ ...h, type: v })}
              title="Aquarium"
              sub="An indoor tank"
            />
            <Choice
              name="type"
              value="pond"
              checked={h.type === 'pond'}
              onChange={(v) => setH({ ...h, type: v })}
              title="Pond"
              sub="An outdoor pond"
            />
          </div>
        </Field>
        <div className={formGrid}>
          <Field id="volume" label="Volume in litres" optional error={errors.volume}>
            <input
              type="number"
              id="volume"
              min="5"
              inputMode="numeric"
              value={h.volume}
              onChange={set('volume')}
              className="max-w-40"
            />
          </Field>
          {h.type === 'pond' ? (
            <Field id="depth" label="Deepest point in cm" optional>
              <input
                type="number"
                id="depth"
                inputMode="numeric"
                value={h.depth}
                onChange={set('depth')}
                className="max-w-40"
              />
            </Field>
          ) : (
            phField
          )}
          <Field id="tempMin" label="Lowest water temperature in °C" optional error={errors.tempMin}>
            <input
              type="number"
              id="tempMin"
              inputMode="decimal"
              value={h.tempMin}
              onChange={set('tempMin')}
              className="max-w-40"
            />
          </Field>
          <Field id="tempMax" label="Highest water temperature in °C" optional error={errors.tempMax}>
            <input
              type="number"
              id="tempMax"
              inputMode="decimal"
              value={h.tempMax}
              onChange={set('tempMax')}
              className="max-w-40"
            />
          </Field>
          {h.type === 'pond' && phField}
          {yn('filter', 'Is a filter running?', [
            ['yes', 'Yes'],
            ['no', 'No'],
          ])}
          {yn('cycled', 'Is the filter cycled?', [
            ['yes', 'Yes'],
            ['no', 'No'],
            ['unsure', 'Not sure'],
          ])}
          <Field id="light" label="Lighting" optional>
            <select id="light" value={h.light} onChange={set('light')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field id="inh" label="What already lives there?" optional hint="For example “6 rasboras, 2 snails”." full>
            <input type="text" id="inh" value={h.inhabitants} onChange={set('inhabitants')} />
          </Field>
        </div>
        <div className={cx(formFoot, 'mt-0')}>
          <Button type="submit">{back ? 'Save and return to the check' : 'Save'}</Button>
          <Button variant="quiet" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/** My tanks and ponds (M-02): saved habitats, reused across compatibility checks. Requires login. */
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
      <PageHead title="My tanks and ponds" actions={<Button onClick={add}>Add a tank or pond</Button>}>
        Save each tank or pond once, then use it whenever you check whether a listing suits you.
      </PageHead>
      {mine.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {mine.map((h) => {
            const missing = missingCount(h);
            return (
              <article key={h.id} className={cx(panel, 'grid content-start gap-4')}>
                <div className="grid gap-2">
                  <h2 className="text-lg">{h.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="pri">{h.type === 'pond' ? 'Pond' : 'Aquarium'}</Chip>
                    {missing ? (
                      <Chip tone="warn">{`${missing} detail${missing > 1 ? 's' : ''} missing`}</Chip>
                    ) : (
                      <Chip tone="ok">Complete</Chip>
                    )}
                  </div>
                </div>
                <HabitatSummary habitat={h} />
                <div>
                  <Button variant="secondary" size="sm" onClick={() => go('habitat', { edit: h.id })}>
                    Edit<span className="sr-only"> {h.name}</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="You have not added a tank or pond yet.">
          <Button size="sm" onClick={add}>
            Add a tank or pond
          </Button>
        </Empty>
      )}
    </div>
  );
}
