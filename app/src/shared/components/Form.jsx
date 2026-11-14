import { cx } from '../styles';

export const Req = () => <span className="text-bad font-normal">*</span>;

export function FieldError({ id, children }) {
  return children ? (
    <span className="text-bad text-xs font-bold" id={id ? `e-${id}` : undefined}>
      {children}
    </span>
  ) : null;
}

/**
 * Field wrapper (SH-02): label, control, hint and error in the agreed order.
 * Pass `legend` instead of `label` to render a <fieldset> (for radio groups).
 */
export function Field({ id, label, legend, required, hint, error, full, className, children }) {
  const cls = cx('grid min-w-0 gap-1.5', full && 'col-span-full', error && 'has-error', className);
  const title = (text) => (
    <>
      {text} {required && <Req />}
    </>
  );
  if (legend)
    return (
      <fieldset className={cls}>
        <legend className="mb-1.5 text-sm font-bold">{title(legend)}</legend>
        {children}
        {hint && <span className="text-ink-2 text-xs">{hint}</span>}
        <FieldError id={id}>{error}</FieldError>
      </fieldset>
    );
  return (
    <div className={cls}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold">
          {title(label)}
        </label>
      )}
      {children}
      {hint && <span className="text-ink-2 text-xs">{hint}</span>}
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

/** Choice card: a radio styled as a selectable card. */
export function Choice({ name, value, checked, onChange, title, sub }) {
  return (
    <label className="rounded-ab border-line bg-surface has-checked:border-primary has-checked:bg-primary-soft has-focus-visible:outline-primary relative grid cursor-pointer gap-1 border p-4 has-checked:shadow-[inset_0_0_0_1px_var(--color-primary)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="pointer-events-none absolute opacity-0"
      />
      <strong className="font-display text-[1.0625rem] font-semibold">{title}</strong>
      {sub && <span className="text-ink-2 text-sm">{sub}</span>}
    </label>
  );
}

/** Segmented control for filters. options: [[value, label], …] */
export function Segmented({ value, onChange, options }) {
  return (
    <div className="rounded-ab border-line bg-surface inline-flex overflow-hidden border">
      {options.map(([v, l], i) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cx(
            'text-ink-2 aria-pressed:bg-primary-soft aria-pressed:text-primary px-3.5 py-[9px] text-sm aria-pressed:font-bold',
            i > 0 && 'border-line border-l',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Underlined tabs. tabs: [[value, label, count?], …] */
export function Tabs({ value, onChange, tabs }) {
  return (
    <div className="border-line mb-6 flex flex-wrap gap-1 border-b" role="tablist">
      {tabs.map(([v, l, count]) => (
        <button
          key={v}
          role="tab"
          type="button"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className="text-ink-2 aria-selected:border-primary aria-selected:text-ink -mb-px border-b-2 border-transparent px-3 py-2.5 text-sm aria-selected:font-bold"
        >
          {l}
          {count !== undefined && <span className="text-ink-2 ml-1 font-mono text-[0.75rem]">{count}</span>}
        </button>
      ))}
    </div>
  );
}
