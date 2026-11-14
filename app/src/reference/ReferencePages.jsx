/**
 * Team reference (prototype only): overview, demo flows, screen map with a page per screen, and the design system.
 * Lives under /team with its own sub-navigation so it never mixes with the product pages.
 */
import { Link, NavLink, useParams } from 'react-router';
import { Steps } from '../features/home/HomePage';
import { evaluateIntake } from '../features/guidance/rules';
import { RangeBar } from '../features/habitat/RangeBar';
import { ListingCard } from '../features/listings/ListingCard';
import { table, tableWrap } from '../features/listings/MyListingsPage';
import { ROUTES, to } from '../routes';
import { COMPAT_OUTCOME, GUIDANCE_OUTCOME, LISTING_STATUS, REQUEST_STATUS } from '../services/contracts';
import { byId } from '../services/seed';
import { useStore } from '../services/store';
import { Button } from '../shared/components/Button';
import { Chip, statusLabel } from '../shared/components/Chip';
import { Notice, Warning } from '../shared/components/Feedback';
import { Check, Choice, ErrorSummary, Field } from '../shared/components/Form';
import { SpeciesArt } from '../shared/components/SpeciesArt';
import { Tracker } from '../shared/components/Tracker';
import { useGo } from '../shared/hooks';
import { cx, formGrid, kv, reasons, row, wrap } from '../shared/styles';
import { FLOWS } from './flows';
import {
  AREAS,
  backlogTasks,
  demoStepsFor,
  epics,
  GITHUB,
  JIRA_BOARD,
  JIRA_BROWSE,
  jiraKey,
  SCREENS,
  storiesFor,
  storyText,
  tasksFor,
} from './screens';
import { useTour } from './tour';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/* ---------- Layout ---------- */

const SUBNAV = [
  ['/team', 'Overview', true],
  ['/team/demos', 'Demo flows'],
  ['/team/screens', 'Screen map'],
  ['/team/design', 'Design system'],
];

function TeamLayout({ title, intro, crumbs, children }) {
  return (
    <>
      <div className="border-line bg-mist border-b">
        <div className={cx(wrap, 'flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm')}>
          <strong>Team reference</strong>
          <span className="text-ink-2">How AquaBridge is built, for the team. Not part of the public site.</span>
          <Link to="/" className="ml-auto">
            Back to the site
          </Link>
        </div>
      </div>
      <div
        className={cx(wrap, 'grid grid-cols-[210px_minmax(0,1fr)] gap-12 pt-8 pb-20 max-lg:grid-cols-1 max-lg:gap-6')}
      >
        <nav aria-label="Team reference" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="m-0 grid list-none gap-0.5 p-0 max-lg:flex max-lg:flex-wrap max-lg:gap-2">
            {SUBNAV.map(([path, label, end]) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={end}
                  className="rounded-ab-sm text-ink hover:bg-mist hover:text-ink aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-hover max-lg:border-line block px-3 py-2 no-underline aria-[current=page]:font-semibold max-lg:border"
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="text-ink-2 mt-6 mb-2 px-3 text-xs font-semibold max-lg:hidden">Elsewhere</p>
          <ul className="m-0 grid list-none gap-1 p-0 px-3 text-sm max-lg:hidden">
            <li>
              <a href="/backlog/">Sprint 1 backlog</a>
            </li>
            <li>
              <a href={JIRA_BOARD} target="_blank" rel="noreferrer">
                Jira board
              </a>
            </li>
            <li>
              <a href={GITHUB} target="_blank" rel="noreferrer">
                Code on GitHub
              </a>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">
          {crumbs && <p className="mb-3 text-sm">{crumbs}</p>}
          <div className="mb-10 grid gap-3">
            <h1>{title}</h1>
            {intro && <p className="text-md text-ink-2 max-w-[66ch]">{intro}</p>}
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

const Section = ({ title, id, children, intro }) => (
  <section id={id} className="border-line grid scroll-mt-24 gap-4 border-t pt-8 pb-10 first:border-t-0 first:pt-0">
    <div className="grid gap-1">
      <h2 className="text-xl">{title}</h2>
      {intro && <p className="text-ink-2 max-w-[66ch]">{intro}</p>}
    </div>
    {children}
  </section>
);

const Code = ({ children }) => (
  <pre className="rounded-ab-sm bg-mist font-code text-ink overflow-x-auto p-4 text-[0.8125rem] leading-relaxed">
    <code>{children}</code>
  </pre>
);

/* ---------- Overview ---------- */

export function TeamHomePage() {
  const screens = Object.keys(SCREENS).length;
  const steps = Object.values(FLOWS).reduce((n, f) => n + f.steps.length, 0);
  return (
    <TeamLayout
      title="Team reference"
      intro="Everything the team needs to build Sprint 1 from this prototype: the journeys, every screen with its tickets, and the design system. Use it for inspiration. The product pages only link here from the footer."
    >
      <Section title="Start here">
        <ul className="m-0 grid list-none grid-cols-2 gap-x-10 p-0 max-md:grid-cols-1">
          {[
            [
              '/team/demos',
              'Demo flows',
              `${Object.keys(FLOWS).length} guided walkthroughs, ${steps} steps. Press Next and the prototype does each action.`,
            ],
            [
              '/team/screens',
              'Screen map',
              `All ${screens} screens grouped by journey. Each has a page with its purpose, contents, tickets, stories and demo steps.`,
            ],
            [
              '/team/design',
              'Design system',
              'Colours, type, components and code snippets to copy, plus the rules every screen follows.',
            ],
            [
              '/backlog/',
              'Sprint 1 backlog',
              `${backlogTasks.length} tickets with what to build, states and acceptance criteria. Filter by person and week.`,
            ],
          ].map(([href, t, d]) => (
            <li key={t} className="border-line grid gap-1 border-t py-5">
              {href.startsWith('/team') ? (
                <Link to={href} className="text-lg font-semibold">
                  {t}
                </Link>
              ) : (
                <a href={href} className="text-lg font-semibold">
                  {t}
                </a>
              )}
              <p className="text-ink-2">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Who builds what"
        intro="Each person owns a feature folder in app/src/features, so most work happens without touching each other’s files."
      >
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th>Person</th>
                <th>Area</th>
                <th>Folder</th>
                <th>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Shawn', 'Listings, the requests service and the owner inbox', 'features/listings'],
                ['Farhan', 'Guided rehoming, species guidance, routes and sign-in', 'features/guidance, features/auth'],
                [
                  'Midhir',
                  'Tanks and ponds, compatibility, adopter requests and shared components',
                  'features/habitat, shared',
                ],
              ].map(([who, area, folder]) => (
                <tr key={who}>
                  <td className="font-semibold">{who}</td>
                  <td>{area}</td>
                  <td>
                    <code className="font-code text-[0.8125rem]">{folder}</code>
                  </td>
                  <td>{backlogTasks.filter((t) => t.owner === who).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Epics">
        <dl className={kv}>
          {epics.map((e) => (
            <div key={e.key} className="contents">
              <dt>{e.name}</dt>
              <dd>
                {e.summary}
                <span className="text-ink-2 block text-sm">Stories: {e.stories}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="How we work">
        <ol className="m-0 grid list-decimal gap-2 pl-6">
          <li>
            Pick up your ticket on the{' '}
            <a href={JIRA_BOARD} target="_blank" rel="noreferrer">
              Jira board
            </a>{' '}
            and move it to In Progress.
          </li>
          <li>
            Open the matching screen page in the screen map: it lists what to build, the states and the acceptance
            criteria.
          </li>
          <li>Work on a branch. Every push gets its own Vercel preview link to share.</li>
          <li>Open a pull request, move the ticket to In Review and ask a teammate to review it.</li>
          <li>
            Merge to main once the acceptance criteria are met. The live site updates in about a minute. Move the ticket
            to Resolved.
          </li>
        </ol>
      </Section>

      <Section title="Run it on your computer">
        <Code>{`cd app
npm install      # first time only
npm run dev      # http://localhost:5173
npm test
npm run lint`}</Code>
      </Section>

      <Section
        title="Shared status values"
        intro="The code uses the contract value; people see the wording on the tag."
      >
        <div className={tableWrap}>
          <table className={table}>
            <thead>
              <tr>
                <th>Group</th>
                <th>Contract value and the tag people see</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Listing', LISTING_STATUS],
                ['Request', REQUEST_STATUS],
                ['Compatibility', COMPAT_OUTCOME],
                ['Guidance', GUIDANCE_OUTCOME],
              ].map(([g, list]) => (
                <tr key={g}>
                  <td className="font-semibold">{g}</td>
                  <td>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {list.map((s) => (
                        <span key={s} className="inline-flex items-center gap-2">
                          <code className="font-code text-ink-2 text-[0.8125rem]">{s}</code>
                          <Chip status={s} />
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ink-2 text-sm">
          ID prefixes (code only): SP-### species · IC-### intake · L-#### listing · H-### habitat · R-### request ·
          U-## user. Only the request reference is shown to people, on the confirmation page.
        </p>
      </Section>
    </TeamLayout>
  );
}

/* ---------- Demo flows ---------- */

export function DemosPage() {
  const { start } = useTour();
  return (
    <TeamLayout
      title="Demo flows"
      intro="Guided walkthroughs of both journeys, including a first-time adopter and the cases where a listing is not allowed. Each starts from fresh sample data. A guide says who is acting, what they do, what the system does and who builds it. Press Next step and the prototype does the action for you."
    >
      {Object.entries(FLOWS).map(([k, f]) => (
        <Section key={k} id={k} title={`${f.label}: ${f.title}`} intro={f.summary}>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => start(k)}>Start this demo</Button>
            <span className="text-ink-2 text-sm">
              {f.steps.length} steps · Covers {f.covers}
            </span>
          </div>
          <details className="rounded-ab-sm border-line border">
            <summary className="cursor-pointer px-4 py-3 font-semibold">See all {f.steps.length} steps</summary>
            <div className="border-line border-t px-4 pb-2">
              <Steps items={f.steps.map((s) => [s.title, `${s.actor} · ${ROUTES[s.route]?.title} · ${s.who}`])} />
            </div>
          </details>
        </Section>
      ))}
    </TeamLayout>
  );
}

/* ---------- Screen map ---------- */

function useOpenScreen() {
  const { update } = useStore();
  const go = useGo();
  return (k) => {
    if (['review', 'guidance'].includes(k))
      update((s) => {
        if (s.intake.answers.speciesId) return;
        s.intake.answers = {
          kind: 'animal',
          speciesId: 'SP-002',
          quantity: '6',
          condition: 'healthy',
          reason: 'moving',
          location: 'Uxbridge, UB8',
          urgency: 'month',
        };
        s.intake.outcome = evaluateIntake(s.intake.answers);
      });
    go(k, SCREENS[k]?.example || {});
  };
}

export function MapPage() {
  const open = useOpenScreen();
  return (
    <TeamLayout
      title="Screen map"
      intro="Every screen in the product, grouped by journey. Open a screen’s page for its purpose, what is on it, its tickets and acceptance criteria, its user stories and the demo steps that show it."
    >
      {AREAS.map(([area, title, intro]) => {
        const rows = Object.entries(SCREENS).filter(([, s]) => s.area === area);
        return (
          <Section key={area} id={area} title={title} intro={intro}>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th>Screen</th>
                    <th>Built by</th>
                    <th>Tickets</th>
                    <th>Sign-in</th>
                    <th>
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([k]) => {
                    const r = ROUTES[k];
                    return (
                      <tr key={k}>
                        <td>
                          <Link to={to('screen', { name: k })} className="font-semibold">
                            {r.title}
                          </Link>
                          <span className="text-ink-2 block max-w-[52ch] text-sm">{SCREENS[k].purpose}</span>
                        </td>
                        <td>{r.owner}</td>
                        <td>{r.tasks}</td>
                        <td>{r.auth ? 'Required' : 'No'}</td>
                        <td className="text-right whitespace-nowrap">
                          <Button variant="quiet" size="sm" onClick={() => open(k)}>
                            Open<span className="sr-only"> {r.title}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        );
      })}
    </TeamLayout>
  );
}

const List = ({ title, items }) =>
  items?.length > 0 && (
    <div className="grid gap-1">
      <h4 className="font-semibold">{title}</h4>
      <ul className={reasons}>
        {items.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );

function TicketDetails({ t }) {
  const key = jiraKey(t.id);
  return (
    <details className="rounded-ab-sm border-line border">
      <summary className="cursor-pointer px-4 py-3">
        <span className="font-semibold">
          {t.id} {t.summary}
        </span>
        <span className="text-ink-2 ml-3 text-sm">
          {t.owner} · {t.week === 4 ? 'Deferred' : `Week ${t.week}`} · {t.priority} priority
        </span>
      </summary>
      <div className="border-line grid gap-4 border-t px-4 py-4 text-sm">
        <p>{t.description}</p>
        <List title="What to build" items={t.build} />
        <List title="States to handle" items={t.states} />
        {t.data && (
          <p>
            <strong>Data: </strong>
            {t.data}
          </p>
        )}
        {t.depends && (
          <p>
            <strong>Depends on: </strong>
            {t.depends}
          </p>
        )}
        <List title="Acceptance criteria" items={t.ac} />
        {key && (
          <p>
            <a href={`${JIRA_BROWSE}${key}`} target="_blank" rel="noreferrer">
              Open {key} in Jira
            </a>
          </p>
        )}
      </div>
    </details>
  );
}

export function ScreenPage() {
  const { name } = useParams();
  const open = useOpenScreen();
  const { start } = useTour();
  const r = ROUTES[name];
  const info = SCREENS[name];
  if (!r || !info)
    return (
      <TeamLayout title="Screen not found" crumbs={<Link to="/team/screens">← Screen map</Link>}>
        <p>
          That screen is not in the map. <Link to="/team/screens">Go back to the screen map</Link>.
        </p>
      </TeamLayout>
    );
  const tickets = tasksFor(name);
  const stories = storiesFor(name);
  const demoSteps = demoStepsFor(name);
  const area = AREAS.find(([a]) => a === info.area)?.[1];

  return (
    <TeamLayout title={r.title} intro={info.purpose} crumbs={<Link to="/team/screens">← Screen map</Link>}>
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <Button onClick={() => open(name)}>Open this screen</Button>
        {demoSteps[0] && (
          <Button variant="secondary" onClick={() => start(demoSteps[0].flowKey, demoSteps[0].index)}>
            Play it in a demo
          </Button>
        )}
      </div>

      <dl className={cx(kv, 'mb-10 max-w-3xl')}>
        <dt>Journey</dt>
        <dd>{area}</dd>
        <dt>Address</dt>
        <dd>
          <code className="font-code text-[0.8125rem]">{[r.path, ...(r.alt || [])].join('  ·  ')}</code>
        </dd>
        <dt>Built by</dt>
        <dd>{r.owner}</dd>
        <dt>Sign-in</dt>
        <dd>{r.auth ? 'Required. Signed-out people are sent to sign in and brought back.' : 'Not required'}</dd>
        <dt>Tickets</dt>
        <dd>{r.tasks}</dd>
        <dt>Stories</dt>
        <dd>{r.stories}</dd>
      </dl>

      <Section title="What is on the screen">
        <ul className={reasons}>
          {info.onScreen.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {info.components.length > 0 && (
          <p className="text-sm">
            <strong>Shared components: </strong>
            {info.components.map((c, i) => (
              <span key={c}>
                {i > 0 && ', '}
                <Link to={`/team/design#${slug(c)}`}>{c}</Link>
              </span>
            ))}
          </p>
        )}
      </Section>

      {tickets.length > 0 && (
        <Section
          title="Tickets"
          intro="From the Sprint 1 backlog. Open one for what to build, the states to handle and the acceptance criteria."
        >
          <div className="grid gap-3">
            {tickets.map((t) => (
              <TicketDetails key={t.id} t={t} />
            ))}
          </div>
        </Section>
      )}

      {stories.length > 0 && (
        <Section title="User stories">
          <dl className={kv}>
            {stories.map((id) => (
              <div key={id} className="contents">
                <dt>{id}</dt>
                <dd>{storyText(id)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {demoSteps.length > 0 && (
        <Section title="Where it appears in the demos">
          <ul className="m-0 grid list-none gap-0 p-0">
            {demoSteps.map(({ flowKey, flow, index, step }) => (
              <li
                key={`${flowKey}-${index}`}
                className="border-line flex flex-wrap items-center justify-between gap-3 border-t py-3"
              >
                <span>
                  <strong>{step.title}</strong>
                  <span className="text-ink-2 block text-sm">
                    {flow.short} · step {index + 1} of {flow.steps.length} · {step.actor}
                  </span>
                </span>
                <Button variant="quiet" size="sm" onClick={() => start(flowKey, index)}>
                  Play from here<span className="sr-only">: {step.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </TeamLayout>
  );
}

/* ---------- Design system ---------- */

const PALETTE = [
  ['ink', 'Ink', '#13293D', 'Headings and body text'],
  ['ink-2', 'Secondary text', '#4B5F6B', 'Hints, captions, metadata'],
  ['primary', 'Teal', '#0A6B60', 'The one accent: primary buttons and links'],
  ['primary-soft', 'Teal tint', '#E3F1EE', 'Selected rows, information insets'],
  ['surface', 'White', '#FFFFFF', 'Page background'],
  ['mist', 'Mist', '#F5F7F7', 'Section backgrounds and quiet panels'],
  ['line', 'Line', '#D4DCDC', 'Dividers and table rules'],
  ['line-strong', 'Field border', '#8A9A9E', 'Form fields (3:1 contrast)'],
  ['ok', 'Success', '#1D6E46', 'Live, completed, potential match'],
  ['warn', 'Caution', '#8A5300', 'Waiting, reserved, needs information'],
  ['bad', 'Error', '#B02A22', 'Errors, declined, not compatible, restricted'],
];

const RULES = [
  [
    'One typeface',
    'Atkinson Hyperlegible Next for everything. Hierarchy comes from size and weight, not from mixing fonts or uppercase labels.',
  ],
  [
    'Headings do the work',
    'No small uppercase labels above headings. Use a caption only to show position, such as “Step 2 of 4”.',
  ],
  [
    'People’s words',
    'Say “tank”, “request to adopt” and “waiting for owner”. Never show record IDs, except a reference on a confirmation page.',
  ],
  [
    'Borders only where they separate',
    'Form fields and tables have borders. Content is grouped with space and quiet tints, not boxes inside boxes.',
  ],
  ['One primary action', 'Each screen has one green button. Other actions are grey buttons or text links.'],
  [
    'Errors that help',
    'An error summary at the top, and a message by the field that says how to fix it. Never clear what someone typed.',
  ],
  ['Status needs words', 'Tags always carry text, so colour is never the only signal.'],
  ['Keyboard and mobile first', 'Dark focus outline, 44px touch targets, one column under 900px.'],
];

function Component({ name, file, children, code, note }) {
  return (
    <section id={slug(name)} className="border-line grid scroll-mt-24 gap-4 border-t py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3>{name}</h3>
        <code className="font-code text-ink-2 text-[0.8125rem]">{file}</code>
      </div>
      {note && <p className="text-ink-2 max-w-[66ch]">{note}</p>}
      {children && <div className="rounded-ab border-line border p-6">{children}</div>}
      {code && <Code>{code}</Code>}
    </section>
  );
}

export function DesignPage() {
  const { state } = useStore();
  const sample = byId(state.listings, 'L-1045');
  return (
    <TeamLayout
      title="Design system"
      intro="The colours, type and components every screen uses, so the three feature areas feel like one service. Tokens live in app/src/index.css and components in app/src/shared. Each component has a live example and code to copy."
    >
      <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {['Colour', 'Type', 'Components', 'Rules'].map((t) => (
          <a key={t} href={`#${slug(t)}`}>
            {t}
          </a>
        ))}
      </nav>

      <Section
        id="colour"
        title="Colour"
        intro="A calm, light palette with one accent. Teal is reserved for actions and links; status colours are separate and always come with words. Tailwind’s default palette is switched off, so only these names work."
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
          {PALETTE.map(([t, n, hex, use]) => (
            <div key={t} className="grid gap-2">
              <div className="rounded-ab border-line h-16 border" style={{ background: `var(--color-${t})` }} />
              <div className="text-sm">
                <p className="font-semibold">{n}</p>
                <p className="text-ink-2">
                  {hex} · <code className="font-code">{t}</code>
                </p>
                <p className="text-ink-2">{use}</p>
              </div>
            </div>
          ))}
        </div>
        <Code>{`<p className="text-ink-2">Secondary text</p>
<div className="rounded-ab bg-mist p-6">Quiet panel</div>
<div className="border-b border-line">Divider</div>`}</Code>
      </Section>

      <Section
        id="type"
        title="Type"
        intro="Atkinson Hyperlegible Next, designed by the Braille Institute for readers with low vision. One family, weights 400 to 700."
      >
        <div className="grid gap-3">
          <p className="text-3xl leading-tight font-bold">Page title · 48</p>
          <p className="text-2xl font-bold">h1 · 36</p>
          <p className="text-xl font-bold">h2 · 28</p>
          <p className="text-lg font-semibold">h3 · 22</p>
          <p className="max-w-[60ch]">Body · 17px, line height 1.5, lines of about 66 characters.</p>
          <p className="text-ink-2 text-sm">Secondary · 16px</p>
          <p className="text-ink-2 text-xs">Caption · 14px</p>
        </div>
        <Code>{`<h1>Page title</h1>                          // heading sizes come from the base styles
<p className="text-md text-ink-2">Lead paragraph</p>
<p className="text-sm text-ink-2">Secondary text</p>`}</Code>
      </Section>

      <Section id="components" title="Components" intro="Import these instead of rebuilding them.">
        <Component
          name="Button"
          file="shared/components/Button.jsx"
          note="One primary button per screen. Use secondary for the other main action and quiet (a text link) for anything else."
          code={`<Button>Publish listing</Button>
<Button variant="secondary">Save as draft</Button>
<Button variant="quiet">Change</Button>
<Button variant="danger">Decline request</Button>
<Button to="/browse">Browse listings</Button>   // renders a link`}
        >
          <div className={row}>
            <Button>Publish listing</Button>
            <Button variant="secondary">Save as draft</Button>
            <Button variant="quiet">Change</Button>
            <Button variant="danger">Decline request</Button>
            <Button disabled>Request to adopt</Button>
          </div>
        </Component>

        <Component
          name="Tag"
          file="shared/components/Chip.jsx"
          note="Pass a contract status and the tag picks the colour and the wording people see. Never clickable."
          code={`<Chip status="pending" />                 // shows “${statusLabel('pending')}”
<Chip tone="warn">Needs a home soon</Chip>`}
        >
          <div className={row}>
            {[...LISTING_STATUS, ...REQUEST_STATUS.filter((x) => !LISTING_STATUS.includes(x)), ...COMPAT_OUTCOME].map(
              (s) => (
                <Chip key={s} status={s} />
              ),
            )}
          </div>
        </Component>

        <Component
          name="Field"
          file="shared/components/Form.jsx"
          note="Label, hint, error, then the control. Fields are required unless marked optional."
          code={`<Field id="loc" label="Town and postcode district" hint="For example, Ealing, W5" error={errors.location}>
  <input id="loc" type="text" value={town} onChange={(e) => setTown(e.target.value)} />
</Field>
<Field id="care" label="Care notes" optional>…</Field>`}
        >
          <div className={cx(formGrid, 'max-w-[640px]')}>
            <Field id="dsa" label="Town and postcode district" hint="For example, Ealing, W5">
              <input id="dsa" type="text" defaultValue="Uxbridge, UB8" />
            </Field>
            <Field id="dsb" label="How many?" error="Enter a number of 1 or more">
              <input id="dsb" type="number" defaultValue="0" />
            </Field>
          </div>
        </Component>

        <Component
          name="Choice (radio)"
          file="shared/components/Form.jsx"
          code={`<Field legend="Is it an aquarium or a pond?">
  <Choice name="type" value="aquarium" checked={type === 'aquarium'} onChange={setType} title="Aquarium" sub="An indoor tank" />
  <Choice name="type" value="pond" checked={type === 'pond'} onChange={setType} title="Pond" />
</Field>`}
        >
          <div className="grid gap-3">
            <Choice name="ds-type" value="aquarium" checked onChange={() => {}} title="Aquarium" sub="An indoor tank" />
            <Choice
              name="ds-type"
              value="pond"
              checked={false}
              onChange={() => {}}
              title="Pond"
              sub="An outdoor pond"
            />
          </div>
        </Component>

        <Component
          name="Check"
          file="shared/components/Form.jsx"
          code={`<Check id="ack" checked={ack} onChange={setAck}>I understand …</Check>`}
        >
          <Check id="ds-ack" checked onChange={() => {}}>
            I understand the compatibility result is a guide.
          </Check>
        </Component>

        <Component
          name="Error summary"
          file="shared/components/Form.jsx"
          note="Show at the top of the form after a failed submit. It takes focus and links to each field."
          code={`<ErrorSummary errors={errors} ids={{ location: 'loc' }} />`}
        >
          <div className="max-w-[560px]">
            <ErrorSummary errors={{ dsb: 'Enter a number of 1 or more' }} />
          </div>
        </Component>

        <Component
          name="Notice"
          file="shared/components/Feedback.jsx"
          code={`<Notice tone="pri" title="You’ll go back to: Listing editor">Your answers are saved.</Notice>
<Notice tone="warn" title="On hold">You accepted another request.</Notice>`}
        >
          <div className="grid max-w-[560px] gap-4">
            <Notice tone="pri" title="You’ll go back to: Listing editor">
              Your answers are saved and will fill in the listing.
            </Notice>
            <Notice tone="warn" title="On hold">
              You accepted another request for this listing.
            </Notice>
          </div>
        </Component>

        <Component
          name="Warning text"
          file="shared/components/Feedback.jsx"
          code={`<Warning>Never release aquarium or pond animals or plants.</Warning>`}
        >
          <Warning>Never release aquarium or pond animals or plants.</Warning>
        </Component>

        <Component
          name="Outcome box"
          file="features/guidance/GuidancePage.jsx"
          note="Used for guidance and compatibility results. The heading says the result in plain words."
          code={`<Outcome tone="ok">…</Outcome>        // ok · warn · bad`}
        >
          <Notice tone="ok" title="Your tank or pond looks suitable">
            It meets every rule we check for this listing.
          </Notice>
        </Component>

        <Component
          name="Summary list"
          file="shared/styles.js (kv)"
          code={`<dl className={kv}>
  <dt>Temperature</dt><dd>20 to 26 °C</dd>
  <dt>pH</dt><dd>6.0 to 7.0</dd>
</dl>`}
        >
          <dl className={cx(kv, 'max-w-md')}>
            <dt>Temperature</dt>
            <dd>20 to 26 °C</dd>
            <dt>pH</dt>
            <dd>6.0 to 7.0</dd>
            <dt>Smallest tank</dt>
            <dd>54 litres</dd>
          </dl>
        </Component>

        <Component
          name="Range bar"
          file="features/habitat/RangeBar.jsx"
          code={`<RangeBar bar={{ lo: 0, hi: 32, min: 20, max: 26, a: 24, b: 26, ok: true, unit: '°C' }} />`}
        >
          <div className="max-w-[420px]">
            <RangeBar bar={{ lo: 0, hi: 32, min: 20, max: 26, a: 24, b: 26, ok: true, unit: '°C' }} />
            <RangeBar bar={{ lo: 0, hi: 32, min: 10, max: 24, a: 24, b: 26, ok: false, unit: '°C' }} />
          </div>
        </Component>

        <Component name="Handover progress" file="shared/components/Tracker.jsx" code={`<Tracker request={request} />`}>
          <div className="max-w-[360px]">
            <Tracker request={{ status: 'accepted', ownerConfirmed: true, adopterConfirmed: false }} />
          </div>
        </Component>

        <Component
          name="Species illustration"
          file="shared/components/SpeciesArt.jsx"
          code={`<SpeciesArt speciesId="SP-002" />        // add pond for pond species`}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {['SP-001', 'SP-002', 'SP-003', 'SP-004', 'SP-005', 'SP-006', 'SP-007', 'SP-008'].map((id) => (
              <div key={id} className="rounded-ab aspect-[16/10] overflow-hidden">
                <SpeciesArt speciesId={id} pond={id === 'SP-007'} />
              </div>
            ))}
          </div>
        </Component>

        {sample && (
          <Component
            name="Listing card"
            file="features/listings/ListingCard.jsx"
            code={`<ListingCard listing={listing} />`}
          >
            <div className="max-w-[300px]">
              <ListingCard listing={sample} />
            </div>
          </Component>
        )}

        <Component
          name="Confirmation panel"
          file="shared/components/Feedback.jsx"
          code={`<Panel title="Request sent">Your reference R-512</Panel>`}
        >
          <div className="rounded-ab bg-ok p-6 text-center text-white">
            <p className="text-xl font-bold">Request sent</p>
            <p>Your reference R-512</p>
          </div>
        </Component>

        <Component
          name="Empty state"
          file="shared/components/Feedback.jsx"
          code={`<Empty title="No listings match your search.">…one action…</Empty>`}
        >
          <div className="rounded-ab bg-mist grid justify-items-start gap-3 p-6">
            <p className="font-semibold">No listings match your search.</p>
            <Button variant="secondary" size="sm">
              Clear search and filters
            </Button>
          </div>
        </Component>

        <Component
          name="Care needs panel"
          file="features/guidance/CareWidget.jsx"
          code={`<CareWidget speciesId="SP-002" />`}
          note="Shown beside the questionnaire, review, guidance and editor."
        />
        <Component
          name="Radio list"
          file="shared/components/Form.jsx"
          code={`<RadioList name="kind" legend="Type" value={kind} onChange={setKind} options={[['all', 'All', 6], ['plant', 'Plants', 3]]} />`}
          note="Used for the Browse listings filters."
        />
        <Component
          name="Tabs"
          file="shared/components/Form.jsx"
          code={`<Tabs value={tab} onChange={setTab} tabs={[['all', 'All', 5], ['active', 'Live', 2]]} />`}
          note="Used on My listings."
        />
        <Component
          name="Table"
          file="features/listings/MyListingsPage.jsx"
          code={`<div className={tableWrap}><table className={table}>…</table></div>`}
          note="Used on My listings and in the team reference."
        />
        <Component
          name="Inline confirmation"
          file="shared/components/Feedback.jsx"
          code={`<ConfirmInline question="Withdraw this listing?">…Yes, withdraw · Keep it…</ConfirmInline>`}
          note="Used for withdraw and decline instead of browser pop-ups."
        />
      </Section>

      <Section id="rules" title="Rules we follow">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-8 gap-y-6">
          {RULES.map(([b, t]) => (
            <div key={b} className="border-primary grid gap-1 border-t-4 pt-3">
              <p className="font-semibold">{b}</p>
              <p className="text-ink-2 text-sm">{t}</p>
            </div>
          ))}
        </div>
        <p className="text-ink-2 text-sm">
          Why these rules: docs/design-audit.md in the repository explains what makes sites look AI-generated and what
          we did instead.
        </p>
      </Section>
    </TeamLayout>
  );
}
