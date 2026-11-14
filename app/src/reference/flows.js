/**
 * Guided demo flows (prototype only). Each step rebuilds the data from the seed and replays the earlier steps,
 * so Back and Next always land in the same place.
 *
 * step: { actor, title, route, params?, ui?, hl, apply?(s), say, sys (may contain <code>), who }
 *   route/params → which screen opens   ui → that screen's starting state   hl → data-tour name (or a CSS selector) to highlight
 */
import { evaluateIntake } from '../features/guidance/rules';
import { safeSummary } from '../features/habitat/compat';
import { ME } from '../services/contracts';
import { byId, freshIntake, today } from '../services/seed';

const DEMO_ANSWERS = {
  kind: 'animal',
  speciesId: 'SP-002',
  quantity: '6',
  condition: 'healthy',
  reason: 'moving',
  location: 'Uxbridge, UB8',
  urgency: 'month',
  details: 'They share a 60 litre tank with a few cherry shrimp. I can include their food.',
};
const DEMO_DESC =
  'Six neon tetras, about a year old and eating well. I’m moving to a flat and can’t take the tank. They’d suit a heated, planted community tank.';
const DEMO_INTRO =
  'Hi Aisha, I’ve just set up a 30 litre planted tank with low lighting and a cycled filter. The ferns would go on the rocks at the back. I can collect from Reading on a weekend.';
const NEW_ADOPTER_INTRO =
  'Hi Tom, I keep a 120 litre planted tank at 25°C with soft water and a small group of rasboras. I can collect from Slough this week.';

const L = (s, id) => byId(s.listings, id);
const H = (s, id) => byId(s.habitats, id);
const R = (s, id) => byId(s.requests, id);

/** A brand-new adopter: no saved tanks and no requests of their own. */
const asNewAdopter = (s) => {
  s.habitats = s.habitats.filter((h) => h.owner !== ME);
  s.requests = s.requests.filter((r) => r.adopter !== ME);
};
const NEW_TANK = {
  id: 'H-204',
  owner: ME,
  name: 'Living room tank',
  type: 'aquarium',
  volume: 120,
  tempMin: 24,
  tempMax: 26,
  ph: '',
  filter: '',
  cycled: '',
  depth: '',
  light: 'medium',
  inhabitants: '6 harlequin rasboras',
};

export const FLOWS = {
  owner: {
    label: 'Flow 1 · Owner',
    short: 'Flow 1 · Owner rehomes',
    title: 'Rehome six neon tetras',
    summary:
      'An owner who is moving answers the rehoming questions, can list them, signs in and publishes a listing that is already filled in.',
    covers: 'F-01 to F-06 · S-01, S-02, S-04, S-05 · sign-in return',
    steps: [
      {
        actor: 'Owner, signed out',
        title: 'Start from the homepage',
        route: 'home',
        hl: 'start-rehoming',
        say: 'Jordan is moving and can’t take their tetras. They choose “Start rehoming”. No account is needed yet.',
        sys: 'The homepage links to the rehoming questions. Nothing is saved to an account.',
        who: 'Shared homepage · Farhan coordinates routes',
      },
      {
        actor: 'Owner, signed out',
        title: 'Animal or plant?',
        route: 'rehome',
        hl: 'intake-kind',
        apply: (s) => {
          s.intake.step = 1;
          s.intake.answers = { kind: 'animal' };
        },
        say: 'One question per page. The first answer decides which species and questions come next.',
        sys: 'Answers are kept in this browser, never in the address bar. <code>kind: "animal"</code>',
        who: 'Farhan · F-01, F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Which species, and how many?',
        route: 'rehome',
        hl: 'intake-species',
        apply: (s) => {
          s.intake.step = 2;
          Object.assign(s.intake.answers, { speciesId: 'SP-002', quantity: '6' });
        },
        say: 'They choose Neon tetra and enter 6. The care needs appear beside the question straight away.',
        sys: 'Species and care ranges come from the species catalogue. <code>speciesId: "SP-002"</code>',
        who: 'Farhan · F-02, F-05',
      },
      {
        actor: 'Owner, signed out',
        title: 'How is it doing?',
        route: 'rehome',
        hl: 'intake-condition',
        apply: (s) => {
          s.intake.step = 3;
          Object.assign(s.intake.answers, { condition: 'healthy', reason: 'moving' });
        },
        say: 'Healthy, moving home. Choosing anything other than healthy adds a question about the problem.',
        sys: 'Conditional field: <code>condition !== "healthy"</code> shows the health question.',
        who: 'Farhan · F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Where, and how soon?',
        route: 'rehome',
        hl: 'intake-location',
        apply: (s) => {
          s.intake.step = 4;
          Object.assign(s.intake.answers, DEMO_ANSWERS);
        },
        say: 'Town and postcode district only, plus how soon they need a new home.',
        sys: 'Only the town and district are stored, so a public listing never shows a full address.',
        who: 'Farhan · F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Check your answers',
        route: 'review',
        hl: 'review',
        say: 'Every answer has a Change link. Changing one returns them here with everything else kept.',
        sys: 'Edited answers flow through to the guidance and to the listing.',
        who: 'Farhan · F-03',
      },
      {
        actor: 'Owner, signed out',
        title: 'Read the guidance',
        route: 'guidance',
        hl: 'create-listing',
        apply: (s) => {
          s.intake.id = 'IC-301';
          s.seq.intake = 302;
          s.intake.outcome = evaluateIntake(s.intake.answers);
        },
        say: 'A supported, healthy species with no restrictions can be listed. The page explains why and offers “Create my listing”.',
        sys: 'Outcome <code>eligible</code>, saved as intake <code>IC-301</code>. Flow 5 shows the outcomes that hide the listing button.',
        who: 'Farhan · F-04',
      },
      {
        actor: 'Owner, signed out',
        title: 'Sign in only when it matters',
        route: 'signin',
        hl: 'return-notice',
        apply: (s) => {
          s.pending = { to: '/listings/new?from=intake', name: 'editor', label: 'Listing editor' };
        },
        say: 'Publishing needs an account, so Jordan is asked to sign in. The page says where they will go back to.',
        sys: 'Saved return path: <code>/listings/new?from=intake</code>. After signing in the answers are still there.',
        who: 'Shared · Farhan coordinates sign-in',
      },
      {
        actor: 'Owner, signed in',
        title: 'The listing is already filled in',
        route: 'editor',
        params: { fromIntake: true },
        hl: 'prefill',
        apply: (s) => {
          s.user = ME;
          s.pending = null;
        },
        ui: { draftPatch: { title: 'Six neon tetras need a new home', description: DEMO_DESC } },
        say: 'Species, how many, condition, location and timing came from the answers. Jordan adds a description and checks the preview.',
        sys: 'Handoff from intake <code>IC-301</code>. The species is locked to the one the guidance checked.',
        who: 'Farhan F-06 → Shawn S-01',
      },
      {
        actor: 'Owner, signed in',
        title: 'Published to My listings',
        route: 'mylistings',
        hl: 'listing-row',
        apply: (s) => {
          s.listings.unshift({
            id: 'L-1051',
            owner: ME,
            speciesId: 'SP-002',
            title: 'Six neon tetras need a new home',
            qty: 6,
            location: 'Uxbridge, UB8',
            condition: 'healthy',
            urgency: 'month',
            status: 'active',
            created: today(),
            intakeId: 'IC-301',
            description: DEMO_DESC,
            careNotes: DEMO_ANSWERS.details,
          });
          s.seq.listing = 1052;
          s.intake = freshIntake();
        },
        say: 'Publishing checks the form, then the listing shows as live on Jordan’s list.',
        sys: 'Listing <code>L-1051</code> created with <code>status: "active"</code>, <code>intakeId: "IC-301"</code>.',
        who: 'Shawn · S-01, S-04, S-05',
      },
      {
        actor: 'Anyone',
        title: 'Visible to adopters',
        route: 'browse',
        hl: '[data-listing-id="L-1051"]',
        say: 'Anyone can now find it in Browse listings. The card shows a picture, species, town and date; the rest is on the listing page.',
        sys: 'Browse returns listings where <code>status = "active"</code>.',
        who: 'Shawn · S-02',
      },
    ],
  },
  adopter: {
    label: 'Flow 2 · Adopter',
    short: 'Flow 2 · Adopter requests',
    title: 'Check a tank and ask to adopt Java ferns',
    summary:
      'A returning adopter signs in at the compatibility check, sees all three possible results, fixes a missing detail and sends a request.',
    covers: 'S-02, S-03 · M-01 to M-04, M-06, M-07 · S-08 submit',
    setup: (s) => {
      s.requests = s.requests.filter((r) => !['R-510', 'R-508'].includes(r.id));
    },
    steps: [
      {
        actor: 'Adopter, signed out',
        title: 'Browse without an account',
        route: 'browse',
        hl: 'browse-grid',
        say: 'Jordan has a new nano tank and wants plants for it. They browse and filter without signing in.',
        sys: 'Public page. Only live listings are returned.',
        who: 'Shawn · S-02',
      },
      {
        actor: 'Adopter, signed out',
        title: 'Open a listing',
        route: 'listing',
        params: { id: 'L-1044' },
        hl: 'check-compat',
        say: 'The listing page shows the details, the care needs and what to prepare. The main action is “Check compatibility”.',
        sys: 'Listing <code>L-1044</code> and species <code>SP-005</code> go to the compatibility check.',
        who: 'Shawn S-03 + Farhan F-05',
      },
      {
        actor: 'Adopter, signed out',
        title: 'Sign in to use a saved tank',
        route: 'signin',
        hl: 'return-notice',
        apply: (s) => {
          s.pending = { to: '/check/L-1044', name: 'compat', label: 'Compatibility check' };
        },
        say: 'Tanks and ponds are saved to an account, so this is where signing in is needed. Jordan comes straight back to this listing.',
        sys: 'Saved return path: <code>/check/L-1044</code>.',
        who: 'Shared · sign-in',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Result: more details needed',
        route: 'compat',
        params: { id: 'L-1044' },
        ui: { hab: 'H-203' },
        hl: 'outcome',
        apply: (s) => {
          s.user = ME;
          s.pending = null;
        },
        say: 'Against the bedroom nano tank, the pH is missing, so there is no verdict yet. The button asks Jordan to add it.',
        sys: 'Outcome <code>needs_information</code>: at least one rule has no input and none fail.',
        who: 'Midhir · M-03, M-04',
      },
      {
        actor: 'Adopter, signed in',
        title: 'For comparison: not compatible',
        route: 'compat',
        params: { id: 'L-1046' },
        ui: { hab: 'H-201' },
        hl: 'checks',
        say: 'A pond lily against an indoor tank fails an essential rule. There is no request button, and the reason is shown first.',
        sys: 'Outcome <code>blocked</code>: the habitat type rule fails. In Sprint 2 the server rejects a request like this too.',
        who: 'Midhir · M-04',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Add the missing detail',
        route: 'habitat',
        params: { edit: 'H-203' },
        hl: 'habitat-ph',
        apply: (s) => {
          s.returnTo = 'L-1044';
        },
        ui: { hDraftPatch: { ph: 6.8, cycled: 'yes' } },
        say: 'Back on the Java ferns, Jordan edits the saved nano tank and adds a pH of 6.8. Saving returns them to the check.',
        sys: 'Tank <code>H-203</code> is updated once and reused for every later check.',
        who: 'Midhir · M-01, M-02',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Result: looks suitable',
        route: 'compat',
        params: { id: 'L-1044' },
        ui: { hab: 'H-203' },
        hl: 'checks',
        apply: (s) => {
          H(s, 'H-203').ph = 6.8;
          H(s, 'H-203').cycled = 'yes';
          s.returnTo = null;
        },
        say: 'Every rule passes. Each row says what was checked and why, and “Ask Aisha to adopt” appears.',
        sys: 'Outcome <code>potential_match</code>.',
        who: 'Midhir · M-03, M-04',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Write the request',
        route: 'request',
        params: { id: 'L-1044', hab: 'H-203' },
        ui: { intro: DEMO_INTRO },
        hl: 'intro',
        say: 'A short introduction and the chosen tank. The side panel shows exactly what Aisha will see: no tank name, no address.',
        sys: 'Calls <code>RequestService.submit({ listingId, adopterId, habitatId, intro })</code>.',
        who: 'Midhir M-06 → Shawn S-08',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Request sent',
        route: 'sent',
        params: { id: 'R-512' },
        hl: 'request-sent',
        apply: (s) => {
          s.requests.unshift({
            id: 'R-512',
            listingId: 'L-1044',
            adopter: ME,
            habitatId: 'H-203',
            compat: 'potential_match',
            intro: DEMO_INTRO,
            status: 'pending',
            ownerConfirmed: false,
            adopterConfirmed: false,
            created: today(),
            summary: safeSummary(H(s, 'H-203')),
          });
          s.seq.request = 513;
        },
        say: 'A confirmation page gives a reference and explains what happens next, so Jordan is not left wondering.',
        sys: 'Request <code>R-512</code> created with <code>status: "pending"</code>.',
        who: 'Midhir · M-06',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Follow it in My adoption requests',
        route: 'myrequests',
        hl: 'my-request',
        say: 'The request is waiting for the owner. Jordan can withdraw it while it is still waiting.',
        sys: '<code>RequestService.listForAdopter("U-01")</code>.',
        who: 'Midhir · M-07',
      },
      {
        actor: 'Owner → adopter',
        title: 'The owner accepts',
        route: 'myrequests',
        hl: 'track',
        apply: (s) => {
          R(s, 'R-512').status = 'accepted';
          L(s, 'L-1044').status = 'reserved';
        },
        say: 'When the owner accepts (Flow 3 shows their screen), the same request updates here and the handover progress appears.',
        sys: 'One shared request record, so owner and adopter always see the same status.',
        who: 'Shawn S-07 → Midhir M-07',
      },
    ],
  },
  handover: {
    label: 'Flow 3 · Owner and adopter',
    short: 'Flow 3 · Decision and handover',
    title: 'Choose an adopter and complete the handover',
    summary:
      'The owner compares two requests and accepts one. Both sides confirm the handover, and the listing is marked rehomed.',
    covers: 'S-04 to S-08 · M-05, M-07, M-09 · REQ-002 to REQ-006',
    setup: (s) => {
      s.user = ME;
    },
    steps: [
      {
        actor: 'Owner',
        title: 'Two requests arrive',
        route: 'incoming',
        ui: { sel: 'R-501' },
        hl: 'request-list',
        say: 'Jordan’s goldfish have two requests waiting. The account menu shows the count too.',
        sys: '<code>RequestService.listForOwner("U-01")</code>, grouped by listing.',
        who: 'Shawn · S-06',
      },
      {
        actor: 'Owner',
        title: 'Compare their tanks',
        route: 'incoming',
        ui: { sel: 'R-502' },
        hl: 'habitat-summary',
        say: 'Each request has an introduction and a short tank summary: volume, temperature, pH and filter. No address or private tank name.',
        sys: 'Owner-safe summary supplied by the habitat module.',
        who: 'Midhir M-05 → Shawn S-06',
      },
      {
        actor: 'Owner',
        title: 'Decide',
        route: 'incoming',
        ui: { sel: 'R-501' },
        hl: 'accept',
        say: 'Priya has a larger, established tank, so Jordan accepts her request. Declining asks for confirmation first.',
        sys: 'Only the listing owner can accept or decline.',
        who: 'Shawn · S-07',
      },
      {
        actor: 'Owner',
        title: 'Accepted and reserved',
        route: 'incoming',
        ui: { sel: 'R-501' },
        hl: 'track',
        apply: (s) => {
          R(s, 'R-501').status = 'accepted';
          L(s, 'L-1042').status = 'reserved';
        },
        say: 'The listing is reserved and leaves Browse listings. The handover progress starts.',
        sys: '<code>accept("R-501")</code>: request <code>accepted</code>, listing <code>reserved</code>.',
        who: 'Shawn · S-07, S-08',
      },
      {
        actor: 'Owner',
        title: 'The other request is put on hold',
        route: 'incoming',
        ui: { sel: 'R-502' },
        hl: 'on-hold',
        say: 'Only one request per listing can be accepted, so Tom’s request is on hold.',
        sys: 'This rule lives in the request service, not just in which buttons are shown.',
        who: 'Shawn · S-08',
      },
      {
        actor: 'Owner',
        title: 'My listings',
        route: 'mylistings',
        hl: 'listing-row',
        say: 'The goldfish now show as reserved, with the open request.',
        sys: 'Status matches across the list, detail and owner pages.',
        who: 'Shawn · S-04, S-05',
      },
      {
        actor: 'Owner',
        title: 'Owner confirms the handover',
        route: 'incoming',
        ui: { sel: 'R-501' },
        hl: 'track',
        apply: (s) => {
          R(s, 'R-501').ownerConfirmed = true;
        },
        say: 'After Priya collects the fish, Jordan confirms. It is not complete until the adopter confirms too.',
        sys: '<code>confirmHandover("R-501", owner)</code> sets <code>ownerConfirmed: true</code>.',
        who: 'Shawn · S-07',
      },
      {
        actor: 'Adopter',
        title: 'The adopter’s side',
        route: 'myrequests',
        hl: 'adopter-confirm',
        say: 'This is the adopter’s screen. Here Jordan is the adopter on a cherry shrimp request the owner has already confirmed; Priya sees the same for the goldfish.',
        sys: 'Adopter confirmation calls the same service with the adopter’s ID.',
        who: 'Midhir · M-09',
      },
      {
        actor: 'System',
        title: 'Both confirmed: rehomed',
        route: 'incoming',
        ui: { sel: 'R-501' },
        hl: 'complete',
        apply: (s) => {
          const r = R(s, 'R-501');
          r.ownerConfirmed = r.adopterConfirmed = true;
          r.status = 'completed';
          L(s, 'L-1042').status = 'rehomed';
          R(s, 'R-502').status = 'declined';
        },
        say: 'Once both sides confirm, the request is complete and the listing is marked rehomed. Tom’s request is closed.',
        sys: 'Request <code>completed</code>, listing <code>rehomed</code>, other waiting requests <code>declined</code>.',
        who: 'Shawn · S-07, S-08',
      },
      {
        actor: 'Anyone',
        title: 'Gone from Browse listings',
        route: 'browse',
        hl: 'browse-grid',
        say: 'The goldfish no longer appear to adopters.',
        sys: 'Browse only returns live listings.',
        who: 'Shawn · S-02',
      },
      {
        actor: 'Owner',
        title: 'Kept in the owner’s history',
        route: 'mylistings',
        ui: { tab: 'rehomed' },
        hl: 'listing-row',
        say: 'The rehomed listing stays in My listings as a record.',
        sys: 'Rehomed is a final state.',
        who: 'Shawn · S-04',
      },
    ],
  },
  newAdopter: {
    label: 'Flow 4 · New adopter',
    short: 'Flow 4 · First-time adopter',
    title: 'Create an account and add a first tank',
    summary:
      'Someone new to AquaBridge creates an account at the compatibility check, adds their first tank from scratch, fills a gap and asks to adopt.',
    covers: 'REG-001, REG-005 · M-01 to M-04, M-06 · S-03',
    setup: asNewAdopter,
    steps: [
      {
        actor: 'New adopter, signed out',
        title: 'Find something to adopt',
        route: 'listing',
        params: { id: 'L-1045' },
        hl: 'check-compat',
        say: 'Jordan has never used AquaBridge. They find eight neon tetras near them and press “Check compatibility”.',
        sys: 'Public listing page. No account exists yet.',
        who: 'Shawn · S-03',
      },
      {
        actor: 'New adopter, signed out',
        title: 'Create an account',
        route: 'signin',
        params: { tab: 'register' },
        hl: 'return-notice',
        apply: (s) => {
          s.pending = { to: '/check/L-1045', name: 'compat', label: 'Compatibility check' };
        },
        say: 'Checking needs a saved tank, and tanks belong to an account. Jordan creates one; the page says they will come straight back.',
        sys: 'Mock sign-up. The university login replaces this form. Return path <code>/check/L-1045</code>.',
        who: 'Shared · REG-001, REG-005',
      },
      {
        actor: 'New adopter, signed in',
        title: 'No tank saved yet',
        route: 'compat',
        params: { id: 'L-1045' },
        hl: 'add-first-habitat',
        apply: (s) => {
          s.user = ME;
          s.pending = null;
        },
        say: 'Back on the check, it explains what it needs and that the tank is saved once and reused.',
        sys: 'Empty state: the user has no saved tanks or ponds.',
        who: 'Midhir · M-03',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Add the first tank',
        route: 'habitat',
        params: { edit: 'new' },
        hl: 'habitat-form',
        apply: (s) => {
          s.returnTo = 'L-1045';
        },
        ui: {
          hDraftPatch: {
            name: 'Living room tank',
            volume: '120',
            tempMin: '24',
            tempMax: '26',
            inhabitants: '6 harlequin rasboras',
          },
        },
        say: 'Only the name is required. Jordan knows the size and temperature but has not tested the pH yet, so leaves it blank.',
        sys: 'Blank fields are allowed and become “Missing” in the check.',
        who: 'Midhir · M-01',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Some details are missing',
        route: 'compat',
        params: { id: 'L-1045' },
        ui: { hab: 'H-204' },
        hl: 'checks',
        apply: (s) => {
          s.habitats.push({ ...NEW_TANK });
          s.seq.habitat = 205;
          s.returnTo = null;
        },
        say: 'Saving returns to the check. Size and temperature meet the tetras’ needs; pH and the filter are missing.',
        sys: 'Tank <code>H-204</code> saved. Outcome <code>needs_information</code>.',
        who: 'Midhir · M-02, M-04',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Fill the gaps',
        route: 'habitat',
        params: { edit: 'H-204' },
        hl: 'habitat-ph',
        apply: (s) => {
          s.returnTo = 'L-1045';
        },
        ui: { hDraftPatch: { ph: 6.6, filter: 'yes', cycled: 'yes' } },
        say: 'After testing the water, Jordan adds a pH of 6.6 and confirms the filter is running and cycled.',
        sys: 'Same saved tank, edited once.',
        who: 'Midhir · M-01',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Looks suitable',
        route: 'compat',
        params: { id: 'L-1045' },
        ui: { hab: 'H-204' },
        hl: 'outcome',
        apply: (s) => {
          Object.assign(H(s, 'H-204'), { ph: 6.6, filter: 'yes', cycled: 'yes' });
          s.returnTo = null;
        },
        say: 'Every rule passes, so Jordan can ask Tom to adopt.',
        sys: 'Outcome <code>potential_match</code>.',
        who: 'Midhir · M-04',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Ask to adopt',
        route: 'request',
        params: { id: 'L-1045', hab: 'H-204' },
        ui: { intro: NEW_ADOPTER_INTRO },
        hl: 'intro',
        say: 'A short introduction. Tom will see it with a summary of the tank.',
        sys: '<code>RequestService.submit</code> copies an owner-safe summary of the tank into the request.',
        who: 'Midhir M-06 → Shawn S-08',
      },
      {
        actor: 'New adopter, signed in',
        title: 'Request sent',
        route: 'sent',
        params: { id: 'R-512' },
        hl: 'request-sent',
        apply: (s) => {
          s.requests.unshift({
            id: 'R-512',
            listingId: 'L-1045',
            adopter: ME,
            habitatId: 'H-204',
            compat: 'potential_match',
            intro: NEW_ADOPTER_INTRO,
            status: 'pending',
            ownerConfirmed: false,
            adopterConfirmed: false,
            created: today(),
            summary: safeSummary(H(s, 'H-204')),
          });
          s.seq.request = 513;
        },
        say: 'The confirmation gives a reference and the next steps.',
        sys: 'Request <code>R-512</code>, <code>status: "pending"</code>.',
        who: 'Midhir · M-06',
      },
      {
        actor: 'New adopter, signed in',
        title: 'The tank is saved for next time',
        route: 'habitat',
        hl: 'habitat-card',
        say: 'My tanks and ponds now holds the living room tank, ready for the next listing Jordan checks.',
        sys: '<code>listHabitats("U-01")</code> returns the one saved tank.',
        who: 'Midhir · M-02',
      },
    ],
  },
  cannotList: {
    label: 'Flow 5 · Owner',
    short: 'Flow 5 · When it can’t be listed',
    title: 'Restricted species and animals that need checking',
    summary:
      'What an owner sees when a listing is not allowed: a restricted species, then an animal that is unwell. Both get clear next steps instead of an error.',
    covers: 'GUID-004 to GUID-006 · SPEC-003 · F-04, F-05',
    steps: [
      {
        actor: 'Owner, signed out',
        title: 'A restricted species',
        route: 'rehome',
        hl: 'intake-species',
        apply: (s) => {
          s.intake.step = 2;
          s.intake.answers = { kind: 'animal', speciesId: 'SP-008', quantity: '1' };
        },
        say: 'Sam wants to rehome a red-eared slider. As soon as it is chosen, the care panel flags it as a restricted species.',
        sys: 'Species catalogue status <code>restricted</code>.',
        who: 'Farhan · F-02, F-05',
      },
      {
        actor: 'Owner, signed out',
        title: 'It can’t be listed',
        route: 'guidance',
        hl: 'guidance-outcome',
        apply: (s) => {
          Object.assign(s.intake.answers, {
            condition: 'healthy',
            reason: 'time',
            location: 'Hayes, UB3',
            urgency: 'month',
          });
          s.intake.outcome = evaluateIntake(s.intake.answers);
        },
        say: 'The guidance explains why, in plain words. There is no “Create my listing” button.',
        sys: 'Outcome <code>restricted</code>. The editor cannot be reached for this intake.',
        who: 'Farhan · F-04',
      },
      {
        actor: 'Owner, signed out',
        title: 'What to do instead',
        route: 'guidance',
        hl: 'next-steps',
        say: 'Keep caring for it, never release it, and contact a rescue or the local authority.',
        sys: 'Alternative pathway text depends on the outcome.',
        who: 'Farhan · F-04, GUID-006',
      },
      {
        actor: 'Owner, signed out',
        title: 'Look it up in the species guide',
        route: 'speciesDetail',
        params: { id: 'SP-008' },
        hl: 'species-care',
        say: 'The species guide explains the restriction and links to what to do instead. The guide is open to everyone, not only owners.',
        sys: 'Species page for <code>SP-008</code>, from the same catalogue the questionnaire uses.',
        who: 'Farhan · F-08',
      },
      {
        actor: 'Owner, signed out',
        title: 'An animal that is unwell',
        route: 'rehome',
        hl: 'intake-condition',
        apply: (s) => {
          s.intake.step = 3;
          s.intake.answers = {
            kind: 'animal',
            speciesId: 'SP-001',
            quantity: '2',
            condition: 'unwell',
            health: 'White spot, being treated with salt',
            reason: 'moving',
          };
          s.intake.outcome = null;
        },
        say: 'Another owner has goldfish under treatment. Choosing “Unwell” adds a required question about the problem.',
        sys: 'Conditional question shown because <code>condition: "unwell"</code>.',
        who: 'Farhan · F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Needs checking first',
        route: 'guidance',
        hl: 'guidance-outcome',
        apply: (s) => {
          Object.assign(s.intake.answers, { location: 'Watford, WD17', urgency: 'week' });
          s.intake.outcome = evaluateIntake(s.intake.answers);
        },
        say: 'Moving a sick fish could spread disease, so the listing waits. The next steps say to finish treatment and come back.',
        sys: 'Outcome <code>needs_review</code>.',
        who: 'Farhan · F-04, GUID-005',
      },
      {
        actor: 'Anyone',
        title: 'Never release them',
        route: 'help',
        hl: 'never-release',
        say: 'The How it works page explains why releasing is harmful and what to do instead. Every outcome links here.',
        sys: 'Content page, linked from the homepage, footer and guidance.',
        who: 'Shared · SDG 14',
      },
    ],
  },
};
