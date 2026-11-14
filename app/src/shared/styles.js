/** Shared class strings for layout patterns used on every screen. Prefer these over repeating utilities. */
export const cx = (...c) => c.filter(Boolean).join(' ');

export const wrap = 'mx-auto w-full max-w-page px-4 sm:px-6';
export const page = `${wrap} pt-8 pb-20`;
export const stack = 'grid gap-4';
export const stackLg = 'grid gap-10';
export const row = 'flex flex-wrap items-center gap-3';
/** Small secondary text used for captions and field-style labels. Sentence case, never uppercase. */
export const label = 'text-xs font-semibold text-ink-2';
/** Step or section caption above a heading, e.g. "Step 2 of 4". */
export const caption = 'text-md text-ink-2';
export const mono = 'tabular-nums';
export const muted = 'text-ink-2';
/** A grouped surface. Used sparingly: a quiet tint, no border. */
export const panel = 'rounded-ab bg-mist p-6';
/** A white box with a border, for forms and the action box. */
export const box = 'rounded-ab border border-line bg-surface p-6';
export const panelQuiet = 'rounded-ab bg-mist px-5 py-4';
export const reasons = 'm-0 grid list-disc gap-2 pl-[1.2em] marker:text-ink-2';
export const reasonsOl = 'm-0 grid list-decimal gap-2 pl-[1.4em] marker:text-ink-2';
export const formGrid = 'grid grid-cols-2 gap-x-6 gap-y-6 max-sm:grid-cols-1';
export const choices = 'grid gap-3';
export const twoPane = 'grid grid-cols-[minmax(0,1fr)_360px] items-start gap-12 max-lg:grid-cols-1 max-lg:gap-8';
export const sticky = 'lg:sticky lg:top-24';
export const formFoot = 'mt-8 flex flex-wrap items-center gap-4';
/** Summary list: label/value rows with dividers (GOV.UK pattern). */
export const kv =
  'm-0 grid grid-cols-[minmax(110px,auto)_1fr] text-sm [&>dd]:m-0 [&>dd]:border-b [&>dd]:border-line [&>dd]:py-2.5 [&>dd]:tabular-nums [&>dt]:border-b [&>dt]:border-line [&>dt]:py-2.5 [&>dt]:pr-4 [&>dt]:font-semibold';
export const careDl = kv;
export const toolbar = 'mb-6 flex flex-wrap items-end gap-3';
export const crumb = 'text-sm';
export const readable = 'max-w-[66ch]';
