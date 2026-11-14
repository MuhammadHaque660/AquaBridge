import { Notice } from '../../shared/components/Feedback';
import { careDl, cx, label, panel, panelQuiet } from '../../shared/styles';
import { SPECIES } from '../../services/species';

/** Species care reference (F-05) shown beside the questionnaire, review, guidance and editor. */
export function CareWidget({ speciesId }) {
  const s = SPECIES[speciesId];
  if (!s) return <div className={cx(panelQuiet, 'text-ink-2 text-sm')}>Pick a species to see its care reference.</div>;
  return (
    <div className={cx(panel, 'grid gap-3')}>
      <span className={label}>Species guide · {speciesId}</span>
      <h3>{s.common}</h3>
      <p className="text-sm">
        <i>{s.sci}</i>
      </p>
      {s.temp && (
        <dl className={careDl}>
          <dt>Temperature</dt>
          <dd>
            {s.temp[0]}–{s.temp[1]} °C
          </dd>
          <dt>pH</dt>
          <dd>
            {s.ph[0].toFixed(1)}–{s.ph[1].toFixed(1)}
          </dd>
          <dt>Min. volume</dt>
          <dd>{s.minVol} L</dd>
          <dt>Habitat</dt>
          <dd>{s.habitats.join(', ')}</dd>
        </dl>
      )}
      {s.status !== 'supported' && (
        <Notice
          tone={s.status === 'restricted' ? 'bad' : 'warn'}
          title={s.status === 'restricted' ? 'Restricted example' : 'Not identified'}
        />
      )}
      <p className="text-sm">{s.care}</p>
    </div>
  );
}
