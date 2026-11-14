/**
 * Team reference data (prototype only): what each screen is for, what is on it, which shared components it uses,
 * and helpers that join it to the Sprint 1 backlog (planning/sprint1-tasks.json) and the demo flows.
 */
import backlog from '../../../planning/sprint1-tasks.json';
import { ROUTES } from '../routes';
import { FLOWS } from './flows';

export { GITHUB, JIRA_BOARD, JIRA_BROWSE } from './links';

/** Tickets were created in backlog order starting at KAN-7 (KAN-1 to KAN-6 are the epics). */
const jiraKeys = Object.fromEntries(backlog.tasks.map((t, i) => [t.id, `KAN-${7 + i}`]));
export const jiraKey = (taskId) => jiraKeys[taskId];

const article = (as) => (/^[AEIOU]/i.test(as) ? 'an' : 'a');
export const storyText = (id) => {
  const s = backlog.stories.find((x) => x.id === id);
  return (
    s &&
    `As ${article(s.as)} ${s.as.toLowerCase()}, I want to ${s.want.charAt(0).toLowerCase() + s.want.slice(1)}, so that ${s.so}.`
  );
};

const ids = (text) => (text || '').match(/[A-Z]+-\d+/g) || [];
export const tasksFor = (name) =>
  ids(ROUTES[name]?.tasks)
    .map((id) => backlog.tasks.find((t) => t.id === id))
    .filter(Boolean);
export const storiesFor = (name) => ids(ROUTES[name]?.stories).filter((id) => backlog.stories.some((s) => s.id === id));
export const backlogTasks = backlog.tasks;
export const epics = backlog.epics;

/** Every demo step that opens this screen: [{ flowKey, flow, index, step }] */
export const demoStepsFor = (name) =>
  Object.entries(FLOWS).flatMap(([flowKey, flow]) =>
    flow.steps.map((step, index) => ({ flowKey, flow, index, step })).filter((x) => x.step.route === name),
  );

export const AREAS = [
  ['public', 'Public pages', 'Anyone can use these without an account.'],
  ['rehoming', 'Rehoming (owners)', 'From the first question to a confirmed handover.'],
  ['adopting', 'Adopting', 'Saved tanks and ponds, the compatibility check and requests.'],
  ['content', 'Content pages', 'Linked from the header and footer.'],
];

/**
 * Per-screen notes. `example` is where "Open this screen" goes, with sample data.
 * `components` are names on the Design system page.
 */
export const SCREENS = {
  home: {
    area: 'public',
    purpose:
      'Says what AquaBridge does in one line, lets adopters search straight away and sends owners to the rehoming questions.',
    onScreen: [
      'Plain headline and one-paragraph summary',
      'Search box (species or town) that opens Browse listings',
      '“Start rehoming” link',
      'Four most recent live listings',
      'Short “Rehoming yours” and “Adopting” explanations',
      '“Never release them” warning',
    ],
    components: ['Button', 'Listing card', 'Warning text'],
  },
  browse: {
    area: 'public',
    purpose: 'Lets anyone find animals and plants that need a home, without an account.',
    onScreen: [
      'Search by species or town',
      'Filters in a sidebar (type, lives in) with counts; a collapsible “Filter listings” panel on phones',
      'Result count and sort (newest, needs a home soonest)',
      'Grid of listing cards',
      'No-results state with “Clear search and filters”',
    ],
    components: ['Listing card', 'Radio list', 'Empty state'],
  },
  listing: {
    area: 'public',
    purpose:
      'Gives an adopter everything they need to decide whether to check compatibility: the animal, its care needs and what collection involves.',
    onScreen: [
      'Back link to listings',
      'Species illustration',
      'Title, town, listed date and any tags',
      'Description',
      '“About this listing” summary list',
      '“Care needs” summary list with units',
      'Owner’s notes and “Before you collect”',
      'Action box: Check compatibility, or the state of an existing request, or “This is your listing”',
    ],
    components: ['Species illustration', 'Summary list', 'Tag', 'Button'],
    example: { id: 'L-1045' },
  },
  rehome: {
    area: 'rehoming',
    purpose:
      'Asks the owner four short questions so the guidance and the listing are based on facts, not a free-text advert.',
    onScreen: [
      '“Step N of 4” caption and progress bar',
      'One question per page as the heading',
      'Large radios, select and text fields; optional fields say “(optional)”',
      'Error summary after a failed Continue',
      'Care needs panel once a species is chosen',
      '“Never release” warning',
    ],
    components: ['Field', 'Choice (radio)', 'Error summary', 'Care needs panel', 'Warning text'],
  },
  review: {
    area: 'rehoming',
    purpose: 'Lets the owner check every answer before getting guidance, and change any one without starting again.',
    onScreen: [
      'Summary list of every answer',
      'A “Change” link per answer that returns here afterwards',
      '“Get my guidance” button',
    ],
    components: ['Summary list', 'Button'],
  },
  guidance: {
    area: 'rehoming',
    purpose: 'Explains whether a public listing is allowed, why, and what to do next. Never shown as an error.',
    onScreen: [
      'Outcome box: can be listed, needs checking first, or restricted',
      '“Why you’re seeing this” reasons from the answers',
      '“What you can do next” alternatives',
      '“Create my listing” only when it can be listed',
      '“These are example rules” notice',
    ],
    components: ['Outcome box', 'Tag', 'Notice', 'Button'],
  },
  signin: {
    area: 'public',
    purpose:
      'The single place an account is needed. Says where the person will go back to afterwards. The university login replaces this form.',
    onScreen: [
      'Sign in or Create an account',
      '“You’ll go back to …” notice when arriving from a guarded page',
      'Email and password fields (mock)',
      'Prototype note',
    ],
    components: ['Field', 'Notice', 'Button'],
  },
  editor: {
    area: 'rehoming',
    purpose:
      'Turns the rehoming answers into a listing. Most fields arrive filled in; the owner adds a title and description.',
    onScreen: [
      '“We have filled this in from your answers” notice',
      'Title, species (locked), how many, town, condition, timing, description, care notes (optional)',
      'Error summary',
      'Live preview of the listing card',
      'Care needs panel',
      'Publish listing / Save changes, and Save as draft (not for live listings)',
    ],
    components: ['Field', 'Error summary', 'Listing card', 'Care needs panel', 'Button'],
    example: { id: 'L-1048' },
  },
  mylistings: {
    area: 'rehoming',
    purpose: 'The owner’s dashboard: every listing and what to do next with each.',
    onScreen: [
      'Tabs by status with counts',
      'Table: listing, status tag, open requests, listed date',
      'Row actions as links: Edit, Publish, Requests (n), Withdraw (confirm inline), Move to drafts',
      'Empty state per tab',
    ],
    components: ['Tabs', 'Table', 'Tag', 'Inline confirmation'],
  },
  incoming: {
    area: 'rehoming',
    purpose: 'Lets the owner compare adopters fairly and decide, then confirm the handover.',
    onScreen: [
      'Requests grouped by listing, with status tags',
      'Selected request: introduction and an owner-safe tank summary with its compatibility result',
      'Accept, or Decline with inline confirmation',
      '“On hold” notice when another request was accepted',
      'Handover progress and “Confirm handover happened”',
      'Prototype control to play the adopter',
    ],
    components: ['Tag', 'Summary list', 'Handover progress', 'Notice', 'Inline confirmation'],
  },
  habitat: {
    area: 'adopting',
    purpose: 'Where adopters save each tank or pond once, so every compatibility check can reuse it.',
    onScreen: [
      'Saved tanks and ponds with “Complete” or “N details missing”',
      'Add or edit form: name (required), aquarium or pond, volume, temperatures, pH, depth (ponds), filter, cycled, lighting, what lives there',
      'Error summary',
      '“Save and return to the check” when opened from a check',
    ],
    components: ['Summary list', 'Field', 'Choice (radio)', 'Error summary', 'Tag'],
  },
  compat: {
    area: 'adopting',
    purpose: 'Compares a listing’s care needs with a saved tank or pond and explains each result in plain words.',
    onScreen: [
      'Back link to the listing',
      'Tank or pond picker, with edit and add links',
      'Empty state for a first-time adopter',
      'Outcome box: looks suitable, needs more details, or not suitable',
      '“What we checked”: Meets / Does not meet / Missing / Advice per rule',
      'Range bars for temperature and pH',
      'Listing card and care needs beside it',
    ],
    components: ['Outcome box', 'Range bar', 'Tag', 'Listing card', 'Empty state'],
    example: { id: 'L-1045' },
  },
  request: {
    area: 'adopting',
    purpose:
      'Sends the owner a short introduction plus a summary of the adopter’s tank. Only possible after a “looks suitable” result.',
    onScreen: [
      'Chosen tank with its compatibility tag',
      'Introduction (at least 30 characters, no contact details)',
      'Acknowledgement checkbox',
      'Error summary and service errors',
      '“What the owner will see” panel',
      'Listing card',
    ],
    components: ['Field', 'Check', 'Error summary', 'Summary list', 'Listing card'],
    example: { id: 'L-1045', hab: 'H-201' },
  },
  sent: {
    area: 'adopting',
    purpose: 'Confirms the request went, gives a reference and explains what happens next.',
    onScreen: [
      'Green confirmation panel with the reference',
      '“What happens next” steps',
      'Links to My adoption requests and Browse listings',
    ],
    components: ['Confirmation panel', 'Button'],
    example: { id: 'R-510' },
  },
  myrequests: {
    area: 'adopting',
    purpose: 'Lets adopters follow every request they have sent and confirm the handover.',
    onScreen: [
      'One row per request: listing, species, town, owner, sent date and status tag',
      'Waiting: withdraw with inline confirmation',
      'Accepted: handover progress and “I have received them”',
      'Declined and withdrawn messages',
      'Prototype controls to play the owner',
    ],
    components: ['Tag', 'Handover progress', 'Inline confirmation', 'Notice'],
  },
  species: {
    area: 'public',
    purpose:
      'A searchable list of every species AquaBridge supports, plus the restricted ones, so people can read care needs before they rehome or adopt.',
    onScreen: [
      'Search by common or scientific name',
      'Animal or plant filter with counts',
      'One card per species: illustration, name, scientific name, habitat or a “Restricted” tag',
      'No-results state',
    ],
    components: ['Species illustration', 'Radio list', 'Tag', 'Empty state'],
  },
  speciesDetail: {
    area: 'public',
    purpose:
      'Everything about one species: care needs with units, and either live listings for it or, if restricted, why it cannot be listed and what to do instead.',
    onScreen: [
      'Back link to all species',
      'Name, scientific name and a “Restricted” tag when it applies',
      'Illustration',
      'Care text and care needs summary list',
      'Restricted: warning and what to do instead',
      '“Have one to rehome?” box',
      'Live listings for this species',
    ],
    components: ['Species illustration', 'Summary list', 'Warning text', 'Notice', 'Listing card'],
    example: { id: 'SP-002' },
  },
  help: {
    area: 'content',
    purpose: 'Explains both journeys in more detail, what to do instead of releasing, and why it matters (SDG 14).',
    onScreen: [
      'Contents list',
      'Rehoming and adopting steps',
      '“Never release them” warning and alternatives',
      'Why it matters',
    ],
    components: ['Warning text'],
  },
  accessibility: {
    area: 'content',
    purpose: 'States the accessibility standard we aim for and known issues.',
    onScreen: ['What you should be able to do', 'Known issues', 'How to report a problem'],
    components: [],
  },
  privacy: {
    area: 'content',
    purpose: 'Says what the prototype stores (sample data in this browser only) and what the real service will share.',
    onScreen: ['What is stored', 'What the real service shares'],
    components: [],
  },
  contact: {
    area: 'content',
    purpose: 'Who to contact about the prototype.',
    onScreen: ['Team contact'],
    components: [],
  },
};
