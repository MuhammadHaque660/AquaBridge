import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { to } from '../../routes';
import { USERS } from '../../services/contracts';
import * as RequestService from '../../services/requestService';
import { byId } from '../../services/seed';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { Field, FieldError } from '../../shared/components/Form';
import { focusFirstError, useUi } from '../../shared/hooks';
import { cx, formFoot, label, mono, page, panel, panelQuiet, stack, sticky, twoPane } from '../../shared/styles';
import { ListingCard } from '../listings/ListingCard';
import { evaluateCompat, safeSummary } from './compat';
import { HabitatSummary } from './HabitatSummary';

/** Request adoption form (M-06). Calls Shawn's RequestService.submit (S-08). Requires login. */
export function RequestPage() {
  const { id, hab } = useParams();
  const ui = useUi();
  const { state, update, toast } = useStore();
  const navigate = useNavigate();
  const [intro, setIntro] = useState(ui.intro || '');
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState({});
  const [serviceError, setServiceError] = useState(null);
  const l = byId(state.listings, id);
  const h = byId(state.habitats, hab);

  if (!l || !h)
    return (
      <div className={page}>
        <Empty title="Run a compatibility check first.">
          <Button to="/browse" variant="secondary">
            Browse listings
          </Button>
        </Empty>
      </div>
    );

  const res = evaluateCompat(l, h);
  const owner = USERS[l.owner].short;
  const submit = (e) => {
    e.preventDefault();
    const text = intro.trim();
    const err = {};
    if (text.length < 30) err.intro = `Write a little more (${text.length}/30 characters).`;
    if (!ack) err.ack = 'Tick the box to continue.';
    setErrors(err);
    setServiceError(null);
    if (Object.keys(err).length) return focusFirstError();
    try {
      const r = update((s) =>
        RequestService.submit(s, {
          listingId: id,
          adopterId: s.user,
          habitatId: hab,
          intro: text,
          compat: res.outcome,
        }),
      );
      navigate('/account/requests');
      toast(`Request ${r.id} sent to ${owner}`);
    } catch (ex) {
      setServiceError(ex.message);
    }
  };

  return (
    <div className={page}>
      <p className="text-sm [&_a]:no-underline">
        <Link to={to('compat', { id: l.id })}>← Compatibility result</Link>
      </p>
      <PageHead title="Request adoption" className="mt-3">
        {`${owner} will see your introduction and a summary of your habitat.`}
      </PageHead>
      <div className={twoPane}>
        <form className={cx(panel, stack)} noValidate onSubmit={submit}>
          <div className="grid gap-1.5">
            <span className="text-sm font-bold">Habitat</span>
            <div className={cx(panelQuiet, 'flex flex-wrap items-center justify-between gap-3')}>
              <span>
                <strong>{h.name}</strong> <span className={cx(mono, 'text-ink-2')}>{h.id}</span>
              </span>
              <Chip status={res.outcome} />
            </div>
          </div>
          <Field
            id="intro"
            label="Introduce yourself"
            required
            hint="At least 30 characters. Don’t include your phone number or address."
            error={errors.intro}
          >
            <textarea
              id="intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Your experience, your setup and when you could collect"
              data-tour="intro"
            />
          </Field>
          <div className={cx('grid gap-1.5', errors.ack && 'has-error')}>
            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                id="ack"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="accent-primary mt-1 size-[18px]"
              />
              <span>
                I understand the compatibility result is a guide, and I’ll check the details with the owner before
                collecting.
              </span>
            </label>
            <FieldError id="ack">{errors.ack}</FieldError>
          </div>
          {serviceError && (
            <Notice tone="bad" role="alert" title="Couldn’t send request">
              {serviceError}
            </Notice>
          )}
          <div className={cx(formFoot, 'mt-0')}>
            <Button variant="secondary" to={to('compat', { id: l.id })}>
              Back
            </Button>
            <Button type="submit">Send request</Button>
          </div>
        </form>
        <aside className={cx(stack, sticky)}>
          <span className={label}>What the owner will see</span>
          <div className={panel}>
            <HabitatSummary habitat={safeSummary(h)} />
          </div>
          <ListingCard listing={l} />
        </aside>
      </div>
    </div>
  );
}
