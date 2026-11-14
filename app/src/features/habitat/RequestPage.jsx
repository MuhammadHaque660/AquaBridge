import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { to } from '../../routes';
import { USERS } from '../../services/contracts';
import * as RequestService from '../../services/requestService';
import { byId } from '../../services/seed';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { Chip } from '../../shared/components/Chip';
import { BackLink, Empty, Notice, PageHead } from '../../shared/components/Feedback';
import { Check, ErrorSummary, Field } from '../../shared/components/Form';
import { useGo, useUi } from '../../shared/hooks';
import { cx, formFoot, page, panel, stack, sticky, twoPane } from '../../shared/styles';
import { ListingCard } from '../listings/ListingCard';
import { evaluateCompat, safeSummary } from './compat';
import { HabitatSummary } from './HabitatSummary';

/** Request adoption form (M-06). Calls Shawn's RequestService.submit (S-08), then shows the confirmation page. Requires login. */
export function RequestPage() {
  const { id, hab } = useParams();
  const ui = useUi();
  const { state, update } = useStore();
  const navigate = useNavigate();
  const go = useGo();
  const [intro, setIntro] = useState(ui.intro || '');
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState({});
  const [serviceError, setServiceError] = useState(null);
  const l = byId(state.listings, id);
  const h = byId(state.habitats, hab);

  if (!l || !h)
    return (
      <div className={page}>
        <Empty title="Check your tank or pond against a listing first.">
          <Button to="/browse" variant="secondary">
            Browse listings
          </Button>
        </Empty>
      </div>
    );

  const res = evaluateCompat(l, h);
  const owner = USERS[l.owner].short;
  const firstName = owner.split(' ')[0];
  const submit = (e) => {
    e.preventDefault();
    const text = intro.trim();
    const err = {};
    if (text.length < 30)
      err.intro = `Write at least 30 characters to introduce yourself (you have written ${text.length})`;
    if (!ack) err.ack = 'Confirm that you understand the result is a guide';
    setErrors(err);
    setServiceError(null);
    if (Object.keys(err).length) return;
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
      navigate(to('sent', { id: r.id }));
    } catch (ex) {
      setServiceError(ex.message);
    }
  };

  return (
    <div className={page}>
      <PageHead
        title={`Ask ${firstName} to adopt`}
        crumb={
          <BackLink
            to={to('compat', { id: l.id })}
            onClick={(e) => (e.preventDefault(), go('compat', { id: l.id }, { hab: h.id }))}
          >
            Back to the compatibility check
          </BackLink>
        }
      >
        {`${owner} will see your introduction and a summary of your ${h.type}. They can accept or decline.`}
      </PageHead>
      <div className={twoPane}>
        <div>
          <ErrorSummary errors={errors} />
          {serviceError && (
            <Notice tone="bad" role="alert" title="Your request could not be sent" className="mb-8">
              {serviceError}
            </Notice>
          )}
          <form noValidate onSubmit={submit} className="grid gap-8">
            <div className="grid gap-1.5">
              <span className="font-semibold">Tank or pond</span>
              <div className="flex flex-wrap items-center gap-3">
                <span>{h.name}</span>
                <Chip status={res.outcome} />
              </div>
            </div>
            <Field
              id="intro"
              label="Introduce yourself"
              hint="Say what experience you have, describe your setup and when you could collect. Do not include your phone number or address."
              error={errors.intro}
            >
              <textarea
                id="intro"
                rows={6}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                data-tour="intro"
              />
            </Field>
            <Field id="ack-field" error={errors.ack}>
              <Check id="ack" checked={ack} onChange={setAck}>
                I understand the compatibility result is a guide, and I will check the details with {firstName} before
                collecting.
              </Check>
            </Field>
            <div className={cx(formFoot, 'mt-0')}>
              <Button type="submit">Send request</Button>
              <Button variant="quiet" onClick={() => go('compat', { id: l.id }, { hab: h.id })}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
        <aside className={cx(stack, sticky)} aria-label="What the owner will see">
          <div className={cx(panel, 'grid gap-3')}>
            <h2 className="text-lg">What {firstName} will see</h2>
            <p className="text-ink-2 text-sm">
              Your introduction and these details. Not your address or the name of your tank.
            </p>
            <HabitatSummary habitat={safeSummary(h)} />
          </div>
          <ListingCard listing={l} />
        </aside>
      </div>
    </div>
  );
}
