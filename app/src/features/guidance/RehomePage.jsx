import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { listSpecies } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { BackLink, Warning } from '../../shared/components/Feedback';
import { Choice, ErrorSummary, Field } from '../../shared/components/Form';
import { caption, choices, cx, formFoot, page, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { STEPS, validateStep } from './rules';

/** Two-column layout used by the questionnaire, review and guidance pages: content plus a care panel on wide screens. */
export const qwrap = 'grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12 max-lg:grid-cols-1 max-lg:gap-8';

const QUESTION = {
  1: 'What are you rehoming?',
  2: 'Which species is it?',
  3: 'How is it doing?',
  4: 'Where is it, and how soon does it need a home?',
};

/** Field ids each error should link to from the error summary. */
const ERROR_TARGET = {
  kind: 'kind-animal',
  speciesId: 'speciesId',
  quantity: 'quantity',
  condition: 'condition-healthy',
  health: 'health',
  reason: 'reason',
  location: 'location',
  urgency: 'urgency-week',
};

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
      if (k === 'condition' && v === 'healthy') delete s.intake.answers.health;
    });
  const val = (k) => (e) => set(k, e.target.value);
  const goStep = (next) => {
    setErrors({});
    update((s) => {
      s.intake.step = next;
    });
    window.scrollTo({ top: 0 });
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validateStep(n, a);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Arrived from a "Change" link on Check your answers: go straight back there, unless the change
    // (for example animal → plant) means a later question now needs answering.
    const complete = [1, 2, 3, 4].every((step) => !Object.keys(validateStep(step, a)).length);
    if ((state.intake.fromReview && complete) || n === 4) {
      update((s) => {
        s.intake.fromReview = false;
      });
      navigate('/rehome/review');
    } else goStep(n + 1);
  };

  const heading = <h1>{QUESTION[n]}</h1>;
  let body;
  if (n === 1)
    body = (
      <Field legend={heading} legendClass="mb-2" error={errors.kind} id="kind">
        <p className="text-ink-2">We support a small list of aquarium and pond species to start with.</p>
        <div className={cx(choices, 'mt-2')} data-tour="intake-kind">
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
      <div className="grid gap-8">
        {heading}
        <Field
          id="speciesId"
          label="Species"
          hint="If you’re not sure, choose “I’m not sure what it is”. Two restricted examples are included for testing."
          error={errors.speciesId}
        >
          <select
            id="speciesId"
            value={a.speciesId || ''}
            onChange={val('speciesId')}
            data-tour="intake-species"
            className="max-w-md"
          >
            <option value="">Choose a species</option>
            {listSpecies(a.kind).map((s) => (
              <option key={s.id} value={s.id}>
                {s.common}
                {s.status === 'supported' ? ` (${s.sci})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field id="quantity" label="How many are you rehoming?" error={errors.quantity}>
          <input
            type="number"
            id="quantity"
            min="1"
            max="500"
            inputMode="numeric"
            value={a.quantity ?? ''}
            onChange={val('quantity')}
            className="max-w-32"
          />
        </Field>
        {a.kind === 'plant' && (
          <Field id="grownIn" label="Where is it growing at the moment?" optional>
            <select id="grownIn" value={a.grownIn || 'aquarium'} onChange={val('grownIn')} className="max-w-xs">
              <option value="aquarium">Aquarium</option>
              <option value="pond">Pond</option>
            </select>
          </Field>
        )}
      </div>
    );
  if (n === 3)
    body = (
      <div className="grid gap-8">
        <Field legend={heading} legendClass="mb-2" error={errors.condition} id="condition">
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
          <Field
            id="health"
            label="Describe the problem or treatment"
            hint="This helps us suggest the right next step."
            error={errors.health}
          >
            <textarea
              id="health"
              value={a.health ?? ''}
              onChange={val('health')}
              className="max-w-xl"
              placeholder={
                a.kind === 'plant'
                  ? 'For example, some yellowing leaves and snails present'
                  : 'For example, white spot, treated with salt for a week'
              }
            />
          </Field>
        )}
        <Field id="reason" label="Why are you rehoming?" error={errors.reason}>
          <select id="reason" value={a.reason || ''} onChange={val('reason')} className="max-w-md">
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
      <div className="grid gap-8">
        {heading}
        <Field
          id="location"
          label="Town and postcode district"
          hint="For example, Uxbridge, UB8. Only the town and the first half of the postcode are shown publicly."
          error={errors.location}
        >
          <input
            type="text"
            id="location"
            value={a.location ?? ''}
            onChange={val('location')}
            autoComplete="off"
            data-tour="intake-location"
            className="max-w-md"
          />
        </Field>
        <Field legend="How soon does it need a new home?" error={errors.urgency} id="urgency">
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
        <Field
          id="details"
          label="Anything else an adopter should know?"
          optional
          hint="For example, tank mates, feeding, or equipment you could include."
        >
          <textarea id="details" value={a.details ?? ''} onChange={val('details')} className="max-w-xl" />
        </Field>
      </div>
    );

  return (
    <div className={page}>
      <p className="mb-8">
        {n > 1 ? (
          <BackLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goStep(n - 1);
            }}
          >
            Back
          </BackLink>
        ) : (
          <BackLink
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            Back to home
          </BackLink>
        )}
      </p>
      <div className={qwrap}>
        <form noValidate onSubmit={submit} className="max-w-2xl">
          <ErrorSummary errors={errors} ids={ERROR_TARGET} />
          <p className={cx(caption, 'mb-2')}>
            Step {n} of 4<span className="sr-only">: {STEPS[n - 1]}</span>
          </p>
          <div aria-hidden="true" className="bg-surface-2 mb-6 h-1.5 max-w-xs overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: `${(n / 4) * 100}%` }} />
          </div>
          {body}
          <div className={formFoot}>
            <Button type="submit">{n < 4 ? 'Continue' : 'Check your answers'}</Button>
            {n === 1 && <Link to="/how-it-works">How rehoming works</Link>}
          </div>
        </form>
        <aside className={cx('grid gap-6', sticky)}>
          {n > 1 && a.speciesId && (
            <div className="max-lg:hidden">
              <CareWidget speciesId={a.speciesId} />
            </div>
          )}
          <Warning>
            Never release aquatic animals or plants into ponds, rivers or drains. It harms wildlife and can be an
            offence.
          </Warning>
        </aside>
      </div>
    </div>
  );
}
