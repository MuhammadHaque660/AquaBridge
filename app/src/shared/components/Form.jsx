import { useEffect, useRef } from 'react';
import { cx } from '../styles';

/** Shown after a label when a field can be left blank. Required fields have no marker (GOV.UK pattern). */
export const Optional = () => <span className="text-ink-2 font-normal"> (optional)</span>;

export function FieldError({ id, children }) {
  return children ? (
    <span className="text-bad text-sm font-semibold" id={id ? `e-${id}` : undefined}>
      <span className="sr-only">Error: </span>
      {children}
    </span>
  ) : null;
}

/**
 * Field wrapper (SH-02): label, hint, error, then the control, in that order.
 * Pass `legend` instead of `label` to render a <fieldset> for radio groups.
 * Fields are required unless `optional` is set. `required` is accepted for compatibility and ignored.
 */
export function Field({ id, label, legend, optional, hint, error, full, className, children, legendClass }) {
  const cls = cx(
    'grid min-w-0 gap-1.5',
    full && 'col-span-full',
    error && 'has-error border-l-4 border-bad pl-4',
    className,
  );
  const title = (text) => (
    <>
      {text}
      {optional && <Optional />}
    </>
  );
  const after = (
    <>
      {hint && (
        <span className="text-ink-2 text-sm" id={id ? `h-${id}` : undefined}>
          {hint}
        </span>
      )}
      <FieldError id={id}>{error}</FieldError>
    </>
  );
  if (legend)
    return (
      <fieldset className={cls}>
        <legend className={cx('mb-1.5 font-semibold', legendClass)}>{title(legend)}</legend>
        {after}
        {children}
      </fieldset>
    );
  return (
    <div className={cls}>
      {label && (
        <label htmlFor={id} className="font-semibold">
          {title(label)}
        </label>
      )}
      {after}
      {children}
    </div>
  );
}

/** A large radio button with a label and optional hint (replaces "choice cards"). */
export function Choice({ name, value, checked, onChange, title, sub }) {
  const id = `${name}-${value}`;
  return (
    <div className="flex items-start gap-3">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="accent-primary mt-0.5 size-7 flex-none cursor-pointer"
      />
      <label htmlFor={id} className="grid cursor-pointer gap-0.5 pt-0.5">
        <span className="font-semibold">{title}</span>
        {sub && <span className="text-ink-2 text-sm">{sub}</span>}
      </label>
    </div>
  );
}

/** A labelled checkbox. */
export function Check({ id, checked, onChange, children }) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary mt-0.5 size-6 flex-none cursor-pointer"
      />
      <label htmlFor={id} className="cursor-pointer pt-0.5">
        {children}
      </label>
    </div>
  );
}

/**
 * Error summary (SH-09): shown at the top of a form after a failed submit. Takes focus so screen readers announce it,
 * and each error links to its field. errors: { fieldId: message }
 */
export function ErrorSummary({ errors, ids = {} }) {
  const ref = useRef(null);
  const entries = Object.entries(errors || {});
  const count = entries.length;
  useEffect(() => {
    if (count) ref.current?.focus();
  }, [count, errors]);
  if (!count) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-ab border-bad focus:outline-ink mb-8 grid gap-2 border-4 p-5 focus:outline-3"
    >
      <h2 className="text-lg">There is a problem</h2>
      <ul className="m-0 grid list-none gap-1 p-0">
        {entries.map(([k, msg]) => (
          <li key={k}>
            <a
              href={`#${ids[k] || k}`}
              className="text-bad font-semibold"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(ids[k] || k)?.focus();
              }}
            >
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Radio list used for filters. options: [[value, label, count?], …] */
export function RadioList({ name, legend, value, onChange, options }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 font-semibold">{legend}</legend>
      {options.map(([v, l, n]) => (
        <div key={v} className="flex items-center gap-2.5">
          <input
            type="radio"
            id={`${name}-${v}`}
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="accent-primary size-5 flex-none cursor-pointer"
          />
          <label htmlFor={`${name}-${v}`} className="cursor-pointer">
            {l}
            {n !== undefined && <span className="text-ink-2"> ({n})</span>}
          </label>
        </div>
      ))}
    </fieldset>
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
          className="text-ink-2 hover:text-ink aria-selected:border-primary aria-selected:text-ink -mb-px min-h-11 border-b-4 border-transparent px-3 text-sm aria-selected:font-semibold"
        >
          {l}
          {count !== undefined && <span className="text-ink-2 ml-1">({count})</span>}
        </button>
      ))}
    </div>
  );
}
