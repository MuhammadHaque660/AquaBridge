import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { listSpecies } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Notice, PageHead } from '../../shared/components/Feedback';
import { Choice, Field } from '../../shared/components/Form';
import { focusFirstError } from '../../shared/hooks';
import { choices, cx, formFoot, formGrid, page, panel, stack, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { STEPS, validateStep } from './rules';

export const qwrap = 'grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8 max-lg:grid-cols-1';

function Progress({ n }) {
  return (
    <ol className="mb-6 grid grid-cols-4 gap-1.5" aria-label={`Step ${n} of 4`}>
      {STEPS.map((t, i) => {
        const state = i + 1 < n ? 'done' : i + 1 === n ? 'now' : '';
        return (
          <li
            key={t}
            aria-current={state === 'now' ? 'step' : undefined}
            className={cx(
              "text-ink-2 grid gap-1.5 text-xs before:h-1 before:rounded-[2px] before:content-['']",
              state ? 'before:bg-primary' : 'before:bg-line',
              state === 'now' && 'text-ink font-bold',
            )}
          >
            <span className={cx(state !== 'now' && 'max-sm:hidden')}>
              {i + 1}. {t}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Guided questionnaire (F-01 shell, F-02 questions). No account needed; answers are kept in this browser. */
export function RehomePage() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { step: n, answers: a } = state.intake;

  const set = (k, v) =>
    update((s) => {
      s.intake.answers[k] = v;
      if (k === 'kind') delete s.intake.answers.speciesId;
    });
  const val = (k) => (e) => set(k, e.target.value);
  const goStep = (next) =>
    update((s) => {
      s.intake.step = next;
    });

  const submit = (e) => {
    e.preventDefault();
    const errs = validateStep(n, a);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();
    if (n < 4) {
      goStep(n + 1);
      window.scrollTo({ top: 0 });
    } else navigate('/rehome/review');
  };

  let body;
  if (n === 1)
    body = (
      <Field legend={<h2 className="inline">What are you rehoming?</h2>} error={errors.kind} id="kind">
        <p className="text-ink-2 mb-4">We support a small list of animals and plants to start with.</p>
        <div className={choices} data-tour="intake-kind">
          <Choice
            name="kind"
            value="animal"
            checked={a.kind === 'animal'}
            onChange={(v) => set('kind', v)}
            title="An animal"
            sub="Fish, shrimp, snails or turtles"
          />
          <Choice
            name="kind"
            value="plant"
            checked={a.kind === 'plant'}
            onChange={(v) => set('kind', v)}
            title="A plant"
            sub="Aquarium or pond plants"
          />
        </div>
      </Field>
    );
  if (n === 2)
    body = (
      <div className={stack}>
        <h2>Which species is it?</h2>
        <div className={formGrid}>
          <Field
            id="speciesId"
            label="Species"
            required
            full
            hint="Includes two restricted examples so the team can test that path."
            error={errors.speciesId}
          >
            <select id="speciesId" value={a.speciesId || ''} onChange={val('speciesId')} data-tour="intake-species">
              <option value="">Choose a species</option>
              {listSpecies(a.kind).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.common}
                  {s.status === 'supported' ? ` (${s.sci})` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field id="quantity" label="How many?" required error={errors.quantity}>
            <input
              type="number"
              id="quantity"
              min="1"
              max="500"
              inputMode="numeric"
              value={a.quantity ?? ''}
              onChange={val('quantity')}
            />
          </Field>
          {a.kind === 'plant' && (
            <Field id="grownIn" label="Currently growing in">
              <select id="grownIn" value={a.grownIn || 'aquarium'} onChange={val('grownIn')}>
                <option value="aquarium">Aquarium</option>
                <option value="pond">Pond</option>
              </select>
            </Field>
          )}
        </div>
      </div>
    );
  if (n === 3)
    body = (
      <div className={stack}>
        <h2>Condition and circumstances</h2>
        <Field legend="How is it doing?" required error={errors.condition} id="condition">
          <div className={choices} data-tour="intake-condition">
            {Object.entries(CONDITION).map(([k, v]) => (
              <Choice
                key={k}
                name="condition"
                value={k}
                checked={a.condition === k}
                onChange={(x) => set('condition', x)}
                title={v}
              />
            ))}
          </div>
        </Field>
        {a.condition && a.condition !== 'healthy' && (
          <Field id="health" label="Describe the problem or treatment" required error={errors.health}>
            <textarea
              id="health"
              value={a.health ?? ''}
              onChange={val('health')}
              placeholder={
                a.kind === 'plant'
                  ? 'e.g. some yellowing leaves, snails present'
                  : 'e.g. white spot, treated with salt for a week'
              }
            />
          </Field>
        )}
        <Field id="reason" label="Why are you rehoming?" required error={errors.reason}>
          <select id="reason" value={a.reason || ''} onChange={val('reason')}>
            <option value="">Choose a reason</option>
            {Object.entries(REASON).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>
    );
  if (n === 4)
    body = (
      <div className={stack}>
        <h2>Location and timing</h2>
        <div className={formGrid}>
          <Field
            id="location"
            label="Town and postcode district"
            required
            hint="Only the town and first half of the postcode are shown publicly."
            error={errors.location}
          >
            <input
              type="text"
              id="location"
              value={a.location ?? ''}
              onChange={val('location')}
              placeholder="e.g. Uxbridge, UB8"
              autoComplete="off"
              data-tour="intake-location"
            />
          </Field>
          <Field legend="How soon does it need a new home?" required full error={errors.urgency} id="urgency">
            <div className={choices}>
              {Object.entries(URGENCY).map(([k, v]) => (
                <Choice
                  key={k}
                  name="urgency"
                  value={k}
                  checked={a.urgency === k}
                  onChange={(x) => set('urgency', x)}
                  title={v}
                />
              ))}
            </div>
          </Field>
          <Field id="details" label="Anything else an adopter should know?" full>
            <textarea
              id="details"
              value={a.details ?? ''}
              onChange={val('details')}
              placeholder="Tank mates, feeding, equipment you could include"
            />
          </Field>
        </div>
      </div>
    );

  return (
    <div className={page}>
      <PageHead eyebrow="Rehome · no account needed" title="Tell us about it">
        Four short steps. Your answers stay in this browser until you choose to create a listing.
      </PageHead>
      <div className={qwrap}>
        <form className={panel} noValidate onSubmit={submit}>
          <Progress n={n} />
          {body}
          <div className={formFoot}>
            {n > 1 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setErrors({});
                  goStep(n - 1);
                }}
              >
                ← Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">{n < 4 ? 'Continue' : 'Review my answers'}</Button>
          </div>
        </form>
        <aside className={cx(stack, sticky)}>
          <CareWidget speciesId={a.speciesId} />
          <Notice title="Never release it">
            Releasing aquatic animals or plants into ponds, rivers or drains harms wildlife and can be an offence.
          </Notice>
        </aside>
      </div>
    </div>
  );
}
