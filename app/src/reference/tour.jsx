/** Guided demo engine (prototype only): runs the steps in flows.js and shows the guide panel. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { to } from '../routes';
import { seed } from '../services/seed';
import { useStore } from '../services/store';
import { Button } from '../shared/components/Button';
import { cx } from '../shared/styles';
import { FLOWS } from './flows';

const TourContext = createContext({ tour: null });

export function TourProvider({ children }) {
  const { replace, toast } = useStore();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null); // { flow, i, min }

  const show = useCallback(
    (flow, i) => {
      const f = FLOWS[flow];
      const st = f.steps[i];
      replace((cur) => {
        const s = seed();
        s.notes = cur.notes;
        f.setup?.(s);
        for (let j = 0; j <= i; j++) f.steps[j].apply?.(s);
        return s;
      });
      setTour((t) => ({ flow, i, min: t?.flow === flow ? t.min : false }));
      navigate(to(st.route, st.params), { state: { ui: st.ui } });
    },
    [replace, navigate],
  );

  const value = useMemo(() => {
    const exit = (toDemos = true) => {
      setTour(null);
      if (toDemos) navigate('/demos');
    };
    return {
      tour,
      start: (flow) => show(flow, 0),
      next: () => {
        if (tour.i < FLOWS[tour.flow].steps.length - 1) show(tour.flow, tour.i + 1);
        else {
          exit();
          toast('Demo finished');
        }
      },
      back: () => tour.i > 0 && show(tour.flow, tour.i - 1),
      toggleMin: () => setTour((t) => ({ ...t, min: !t.min })),
      exit,
    };
  }, [tour, show, navigate, toast]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export const useTour = () => useContext(TourContext);

/** The floating guide panel, plus highlighting the element each step is about. */
export function TourPanel() {
  const { tour, next, back, toggleMin, exit } = useTour();
  const location = useLocation();
  const f = tour && FLOWS[tour.flow];
  const st = f?.steps[tour.i];

  useEffect(() => {
    document.body.classList.toggle('touring', !!tour);
  }, [tour]);

  useEffect(() => {
    if (!st?.hl) return;
    const sel = st.hl.startsWith('[') ? st.hl : `[data-tour="${st.hl}"]`;
    let tries = 0;
    let timer;
    // The new screen may still be rendering, so look for the element a few times before giving up.
    const find = () => {
      const el = document.querySelector(`main ${sel}`);
      if (!el) {
        if (++tries < 20) timer = setTimeout(find, 50);
        return;
      }
      el.classList.add('tour-hl');
      el.scrollIntoView({
        block: 'center',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    };
    timer = setTimeout(find, 0);
    return () => clearTimeout(timer);
  }, [st, location.key]);

  if (!tour) return null;
  const n = f.steps.length;
  const fixed =
    'fixed right-[max(16px,env(safe-area-inset-right,0px))] bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-45';

  if (tour.min)
    return (
      <Button className={cx(fixed, 'shadow-card max-w-[calc(100%-32px)]')} onClick={toggleMin}>
        Show demo guide · step {tour.i + 1} of {n}
      </Button>
    );

  return (
    <section
      aria-label="Demo guide"
      aria-live="polite"
      className={cx(
        fixed,
        'rounded-ab border-line bg-surface grid max-h-[min(72vh,600px)] w-[min(400px,calc(100%-32px))] gap-3 overflow-auto border p-5 shadow-[0_12px_40px_rgb(19_41_61/0.18)]',
        'max-sm:left-[max(16px,env(safe-area-inset-left,0px))] max-sm:max-h-[50vh] max-sm:w-auto',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-ink-2 text-sm font-semibold">
          {f.short} · Step {tour.i + 1} of {n}
        </p>
        <Button variant="quiet" size="sm" onClick={toggleMin}>
          Hide
        </Button>
      </div>
      <div className="bg-surface-2 h-1 overflow-hidden rounded-full" aria-hidden="true">
        <span
          className="bg-primary block h-full transition-[width] duration-250"
          style={{ width: `${((tour.i + 1) / n) * 100}%` }}
        />
      </div>
      <div className="grid gap-1">
        <h2 className="text-lg">{st.title}</h2>
        <p className="text-ink-2 text-sm">{st.actor}</p>
      </div>
      <p>{st.say}</p>
      <details className="rounded-ab-sm bg-mist [&_code]:bg-surface [&_code]:font-code px-4 py-3 text-sm [&_code]:rounded-[3px] [&_code]:px-1 [&_code]:text-[0.8125rem] [&_code]:wrap-anywhere">
        <summary className="cursor-pointer font-semibold">What the system does</summary>
        {/* sys strings are written by us in flows.js and only contain <code> tags */}
        <p className="mt-2" dangerouslySetInnerHTML={{ __html: st.sys }} />
        <p className="text-ink-2 mt-2">Built by: {st.who}</p>
      </details>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button variant="secondary" size="sm" onClick={back} disabled={tour.i === 0}>
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="quiet" size="sm" onClick={() => exit()}>
            Exit demo
          </Button>
          <Button size="sm" onClick={next}>
            {tour.i === n - 1 ? 'Finish' : 'Next step'}
          </Button>
        </div>
      </div>
    </section>
  );
}
