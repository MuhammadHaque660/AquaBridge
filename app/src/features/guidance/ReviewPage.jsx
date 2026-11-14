import { Link, useNavigate } from 'react-router';
import { CONDITION, REASON, URGENCY } from '../../services/contracts';
import { SPECIES } from '../../services/species';
import { useStore } from '../../services/store';
import { Button } from '../../shared/components/Button';
import { PageHead } from '../../shared/components/Feedback';
import { formFoot, page, panel, sticky } from '../../shared/styles';
import { CareWidget } from './CareWidget';
import { qwrap } from './RehomePage';
import { evaluateIntake } from './rules';

const TABLE =
  'w-full border-collapse [&_td]:border-b [&_td]:border-line [&_td]:py-3 [&_td]:pr-3 [&_td]:align-top [&_th]:w-[34%] [&_th]:border-b [&_th]:border-line [&_th]:py-3 [&_th]:pr-3 [&_th]:text-left [&_th]:align-top [&_th]:text-sm [&_th]:font-normal [&_th]:text-ink-2';

/** Review answers (F-03): every group has a Change link back to its step. */
export function ReviewPage() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const a = state.intake.answers;
  const s = SPECIES[a.speciesId] || {};
  const editStep = (n) => {
    update((d) => {
      d.intake.step = n;
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
  const row = (k, v) => (
    <tr key={k}>
      <th scope="row">{k}</th>
      <td>{v || <span className="text-ink-2">Not given</span>}</td>
    </tr>
  );
  const group = (title, step, rows) => (
    <div key={title} className="contents">
      <div className="mt-6 flex items-center justify-between">
        <h3>{title}</h3>
        <Button variant="quiet" size="sm" onClick={() => editStep(step)}>
          Change
        </Button>
      </div>
      <table className={TABLE}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
  return (
    <div className={page}>
      <PageHead
        title="Check your answers"
        crumb={
          <Link
            to="/rehome"
            onClick={(e) => {
              e.preventDefault();
              editStep(4);
            }}
          >
            ← Back to questions
          </Link>
        }
      >
        Guidance is based only on what you tell us. Change anything that isn’t right.
      </PageHead>
      <div className={qwrap}>
        <div className={panel} data-tour="review">
          {group('Organism', 1, [row('Type', a.kind === 'plant' ? 'Plant' : 'Animal')])}
          {group('Species', 2, [
            row('Species', s.common),
            row('Quantity', a.quantity),
            a.kind === 'plant' && row('Growing in', a.grownIn || 'aquarium'),
          ])}
          {group('Condition', 3, [
            row('Condition', CONDITION[a.condition]),
            a.health && row('Details', a.health),
            row('Reason', REASON[a.reason]),
          ])}
          {group('Location and timing', 4, [
            row('Location', a.location),
            row('Timing', URGENCY[a.urgency]),
            row('Other details', a.details),
          ])}
          <div className={formFoot}>
            <Button variant="secondary" onClick={() => editStep(4)}>
              ← Back
            </Button>
            <Button onClick={seeGuidance}>See my guidance</Button>
          </div>
        </div>
        <aside className={sticky}>
          <CareWidget speciesId={a.speciesId} />
        </aside>
      </div>
    </div>
  );
}
