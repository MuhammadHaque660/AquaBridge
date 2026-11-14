import { Link } from 'react-router';
import { to } from '../../routes';
import { Notice } from '../../shared/components/Feedback';
import { cx, panel } from '../../shared/styles';
import { CareList } from './CareList';
import { SPECIES } from '../../services/species';

/** Species care reference (F-05) shown beside the questionnaire, review, guidance and editor. */
export function CareWidget({ speciesId }) {
  const s = SPECIES[speciesId];
  if (!s) return <div className={cx(panel, 'text-ink-2 text-sm')}>Choose a species to see its care needs.</div>;
  return (
    <section className={cx(panel, 'grid gap-3')} aria-label={`Care needs: ${s.common}`}>
      <div className="grid gap-0.5">
        <h2 className="text-lg">Care needs: {s.common}</h2>
        <p className="text-ink-2 text-sm">
          <i>{s.sci}</i>
        </p>
      </div>
      <CareList species={s} full={false} />
      {s.status !== 'supported' && (
        <Notice
          tone={s.status === 'restricted' ? 'bad' : 'warn'}
          title={s.status === 'restricted' ? 'Restricted species' : 'Not identified yet'}
        />
      )}
      <p className="text-sm">{s.care}</p>
      <p className="text-xs">
        <Link to={to('speciesDetail', { id: speciesId })}>Read the full {s.common.toLowerCase()} guide</Link>
      </p>
      <p className="text-ink-2 text-xs">Sample reference data, not checked by a specialist.</p>
    </section>
  );
}
