import { Link, useNavigate } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { SPECIES } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { BackLink } from '../../shared/components/Feedback';
import { cx, formFoot, page, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { qwrap } from './RehomePage';
import { evaluateIntake } from './rules';

/** Summary list row: label, answer, Change link (GOV.UK "check answers" pattern). */
const ROW =
  'grid grid-cols-[minmax(0,34%)_1fr_auto] gap-x-4 gap-y-1 border-b border-line py-3 max-sm:grid-cols-[1fr_auto]';

/** Review answers (F-03): every answer has a Change link back to its step. */
export function ReviewPage() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const a = state.intake.answers;
  const s = SPECIES[a.speciesId] || {};
  const editStep = (n) => {
    update((d) => {
      d.intake.step = n;
      d.intake.fromReview = true;
    });
    navigate('/rehome');
  };
  const seeGuidance = () => {
    update((d) => {
      d.intake.id = d.intake.id || 'IC-' + d.seq.intake++;
      d.intake.outcome = evaluateIntake(d.intake.answers);
    });
    navigate('/rehome/guidance');
  };

  const rows = [
    ['Type', a.kind === 'plant' ? 'Plant' : 'Animal', 1],
    ['Species', s.common, 2],
    ['How many', a.quantity, 2],
    a.kind === 'plant' && ['Growing in', a.grownIn === 'pond' ? 'Pond' : 'Aquarium', 2],
    ['Condition', CONDITION[a.condition], 3],
    a.condition !== 'healthy' && a.health && ['Problem or treatment', a.health, 3],
    ['Reason for rehoming', REASON[a.reason], 3],
    ['Location', a.location, 4],
    ['How soon', URGENCY[a.urgency], 4],
    ['Other details', a.details, 4],
  ].filter(Boolean);

  return (
    <div className={page}>
      <p className="mb-8">
        <BackLink
          to="/rehome"
          onClick={(e) => {
            e.preventDefault();
            editStep(4);
          }}
        >
          Back
        </BackLink>
      </p>
      <div className={qwrap}>
        <div className="max-w-2xl">
          <h1 className="mb-3">Check your answers before getting guidance</h1>
          <p className="text-md text-ink-2 mb-8">
            Guidance is based only on what you tell us. Change anything that isn’t right.
          </p>
          <dl className="border-line m-0 border-t" data-tour="review">
            {rows.map(([k, v, step]) => (
              <div key={k} className={ROW}>
                <dt className="font-semibold max-sm:col-span-2">{k}</dt>
                <dd className={cx('m-0', !v && 'text-ink-2')}>{v || 'Not given'}</dd>
                <dd className="m-0 text-right">
                  <Link
                    to="/rehome"
                    onClick={(e) => {
                      e.preventDefault();
                      editStep(step);
                    }}
                  >
                    Change<span className="sr-only"> {k.toLowerCase()}</span>
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
          <div className={formFoot}>
            <Button onClick={seeGuidance}>Get my guidance</Button>
          </div>
        </div>
        <aside className={cx(sticky, 'max-lg:hidden')}>
          <CareWidget speciesId={a.speciesId} />
        </aside>
      </div>
    </div>
  );
}
