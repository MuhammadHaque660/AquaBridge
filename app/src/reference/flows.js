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

const L = (s, id) => byId(s.listings, id);
const H = (s, id) => byId(s.habitats, id);
const R = (s, id) => byId(s.requests, id);

export const FLOWS = {
  owner: {
    label: 'Flow 1 · Owner',
    short: 'Flow 1 · Owner rehomes',
    title: 'Rehome six neon tetras',
    summary:
      'An owner who is moving answers the guided questions, gets an eligible outcome, signs in and publishes a pre-filled listing.',
    covers: 'F-01 to F-06 · S-01, S-02, S-04, S-05 · login return path',
    steps: [
      {
        actor: 'Owner, signed out',
        title: 'Start from the homepage',
        route: 'home',
        hl: 'hero-cta',
        say: 'Jordan is moving and can’t take their tetras. They choose “Rehome an animal or plant”. No account is needed yet.',
        sys: 'The homepage routes to the questionnaire. Nothing is saved to an account.',
        who: 'Shared homepage · Farhan coordinates routes',
      },
      {
        actor: 'Owner, signed out',
        title: 'Choose animal or plant',
        route: 'rehome',
        hl: 'intake-kind',
        apply: (s) => {
          s.intake.step = 1;
          s.intake.answers = { kind: 'animal' };
        },
        say: 'The first answer decides which species and follow-up questions appear next.',
        sys: 'Answers are held in local draft state, never in the URL. <code>kind: "animal"</code>',
        who: 'Farhan · F-01, F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Pick the species and quantity',
        route: 'rehome',
        hl: 'intake-species',
        apply: (s) => {
          s.intake.step = 2;
          Object.assign(s.intake.answers, { speciesId: 'SP-002', quantity: '6' });
        },
        say: 'They pick Neon tetra and enter 6. The species guide on the right shows its care needs straight away.',
        sys: 'Species and care ranges come from the species catalogue. <code>speciesId: "SP-002"</code>',
        who: 'Farhan · F-02, F-05',
      },
      {
        actor: 'Owner, signed out',
        title: 'Describe condition and reason',
        route: 'rehome',
        hl: 'intake-condition',
        apply: (s) => {
          s.intake.step = 3;
          Object.assign(s.intake.answers, { condition: 'healthy', reason: 'moving' });
        },
        say: 'Healthy, moving home. Choosing anything other than healthy adds a required question about the problem.',
        sys: 'Conditional field: <code>condition !== "healthy"</code> shows the health question.',
        who: 'Farhan · F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Location and timing',
        route: 'rehome',
        hl: 'intake-location',
        apply: (s) => {
          s.intake.step = 4;
          Object.assign(s.intake.answers, DEMO_ANSWERS);
        },
        say: 'Town and postcode district only, plus how soon they need a new home.',
        sys: 'Location is stored as town and district so a public listing never shows a full address.',
        who: 'Farhan · F-02',
      },
      {
        actor: 'Owner, signed out',
        title: 'Check the answers',
        route: 'review',
        hl: 'review',
        say: 'Every section has a Change link that jumps back to that step with the answers kept.',
        sys: 'Edited answers flow through to the guidance and the listing pre-fill.',
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
        say: 'A supported, healthy species with no restriction gets the eligible outcome, which explains why and offers “Create my listing”.',
        sys: 'Example outcome <code>eligible</code>, intake saved as <code>IC-301</code>. Needs-review and restricted outcomes hide the listing button.',
        who: 'Farhan · F-04',
      },
      {
        actor: 'Owner, signed out',
        title: 'Log in when it matters',
        route: 'signin',
        hl: 'return-notice',
        apply: (s) => {
          s.pending = { to: '/listings/new?from=intake', name: 'editor', label: 'Listing editor' };
        },
        say: 'Creating a listing needs an account, so Jordan is asked to log in. The panel says where they’ll go back to.',
        sys: 'Saved pending action: <code>{ to: "/listings/new?from=intake" }</code>. After login the user returns there with answers intact.',
        who: 'Shared · Farhan coordinates mock login',
      },
      {
        actor: 'Owner, signed in',
        title: 'Listing editor, pre-filled',
        route: 'editor',
        params: { fromIntake: true },
        hl: 'prefill',
        apply: (s) => {
          s.user = ME;
          s.pending = null;
        },
        ui: { draftPatch: { title: 'Six neon tetras need a new home', description: DEMO_DESC } },
        say: 'Species, quantity, condition, location and timing are already filled in. Jordan adds a title and description and checks the preview.',
        sys: 'Handoff from intake <code>IC-301</code>: speciesId, quantity, condition, location, urgency. The species is locked to the one that was checked.',
        who: 'Farhan F-06 → Shawn S-01',
      },
      {
        actor: 'Owner, signed in',
        title: 'Published to My Listings',
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
        say: 'Publishing validates the form, creates listing L-1051 and shows it as active on the owner’s dashboard.',
        sys: 'Listing created with <code>status: "active"</code>, <code>ownerId: "U-01"</code>, <code>intakeId: "IC-301"</code>.',
        who: 'Shawn · S-01, S-04, S-05',
      },
      {
        actor: 'Anyone',
        title: 'Visible in public browsing',
        route: 'browse',
        hl: '[data-listing-id="L-1051"]',
        say: 'Anyone can now find it in Browse. The card shows only the essentials; the details are on the listing page.',
        sys: 'Browse returns listings where <code>status = "active"</code>.',
        who: 'Shawn · S-02',
      },
    ],
  },
  adopter: {
    label: 'Flow 2 · Adopter',
    short: 'Flow 2 · Adopter requests',
    title: 'Check a habitat and request Java fern',
    summary:
      'An adopter browses, logs in at the compatibility check, sees all three possible results, fixes a missing detail and sends a request.',
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
        say: 'Jordan has set up a new nano tank and wants plants for it. They browse without logging in.',
        sys: 'Public route. Only active listings are returned.',
        who: 'Shawn · S-02',
      },
      {
        actor: 'Adopter, signed out',
        title: 'Open a listing',
        route: 'listing',
        params: { id: 'L-1044' },
        hl: 'check-compat',
        say: 'The listing page shows the full details, the care needs and what to prepare. The main action is “Check compatibility”.',
        sys: 'Listing <code>L-1044</code> and species <code>SP-005</code> are passed to the compatibility check.',
        who: 'Shawn S-03 + Farhan F-05',
      },
      {
        actor: 'Adopter, signed out',
        title: 'Log in to use a saved habitat',
        route: 'signin',
        hl: 'return-notice',
        apply: (s) => {
          s.pending = { to: '/check/L-1044', name: 'compat', label: 'Compatibility check' };
        },
        say: 'Habitats belong to an account, so this is where login is needed. Jordan comes straight back to this listing afterwards.',
        sys: 'Saved pending action: <code>{ to: "/check/L-1044" }</code>.',
        who: 'Shared · mock login',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Result: more information needed',
        route: 'compat',
        params: { id: 'L-1044' },
        ui: { hab: 'H-203' },
        hl: 'outcome',
        apply: (s) => {
          s.user = ME;
          s.pending = null;
        },
        say: 'Compared with the Bedroom nano tank, the pH is missing, so there’s no verdict yet. The button asks Jordan to add it.',
        sys: 'Outcome <code>needs_information</code>: at least one rule is missing input and none fail.',
        who: 'Midhir · M-03, M-04',
      },
      {
        actor: 'Adopter, signed in',
        title: 'For comparison: a blocking mismatch',
        route: 'compat',
        params: { id: 'L-1046' },
        ui: { hab: 'H-201' },
        hl: 'checks',
        say: 'A pond lily compared with an indoor tank fails a hard rule. “Request adoption” is disabled and the reason is shown.',
        sys: 'Outcome <code>blocked</code>: the habitat type rule fails. In Sprint 2 the server also rejects a request like this.',
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
        ui: { hDraftPatch: { ph: 6.8 } },
        say: 'Back on the Java fern, Jordan edits the saved nano tank and adds a pH of 6.8. Saving returns them to the check.',
        sys: 'Habitat <code>H-203</code> is updated once and reused for every future check.',
        who: 'Midhir · M-01, M-02',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Result: potential match',
        route: 'compat',
        params: { id: 'L-1044' },
        ui: { hab: 'H-203' },
        hl: 'checks',
        apply: (s) => {
          H(s, 'H-203').ph = 6.8;
          s.returnTo = null;
        },
        say: 'Every rule now passes. Each row says what was checked and why, and “Request adoption” is enabled.',
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
        say: 'A short introduction and the selected habitat. The right-hand side shows exactly what the owner will see.',
        sys: 'Calls <code>RequestService.submit({ listingId, adopterId, habitatId, intro })</code>.',
        who: 'Midhir M-06 → Shawn S-08',
      },
      {
        actor: 'Adopter, signed in',
        title: 'Track it in My Requests',
        route: 'myrequests',
        hl: 'my-request',
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
        say: 'The request is pending. Jordan can withdraw it while it’s still pending.',
        sys: 'Request <code>R-512</code> created with <code>status: "pending"</code>.',
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
        say: 'When the owner accepts (Flow 3 shows their screen), the same record updates here and the handover tracker appears.',
        sys: 'One shared request record, so the owner and adopter screens always show the same status.',
        who: 'Shawn S-07 → Midhir M-07',
      },
    ],
  },
  handover: {
    label: 'Flow 3 · Owner and adopter',
    short: 'Flow 3 · Decision and handover',
    title: 'Choose an adopter and complete the handover',
    summary:
      'The owner compares two requests and accepts one. Both sides then confirm the handover, and the listing is marked rehomed.',
    covers: 'S-04 to S-08 · M-05, M-07 · REQ-002 to REQ-006',
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
        say: 'Jordan’s goldfish listing has two pending requests. The account menu shows the count too.',
        sys: '<code>RequestService.listForOwner("U-01")</code>, grouped by listing.',
        who: 'Shawn · S-06',
      },
      {
        actor: 'Owner',
        title: 'Compare habitats',
        route: 'incoming',
        ui: { sel: 'R-502' },
        hl: 'habitat-summary',
        say: 'Each request shows the introduction and a short habitat summary: volume, temperature, pH and filtration. No address or profile name.',
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
        say: 'The listing becomes reserved and leaves public browsing. The handover tracker starts.',
        sys: '<code>accept("R-501")</code> sets the request to <code>accepted</code> and the listing to <code>reserved</code>.',
        who: 'Shawn · S-07, S-08',
      },
      {
        actor: 'Owner',
        title: 'The other request goes on hold',
        route: 'incoming',
        ui: { sel: 'R-502' },
        hl: 'on-hold',
        say: 'Only one request per listing can be accepted, so Tom’s request is on hold.',
        sys: 'This rule lives in the request service, not just in which buttons are shown.',
        who: 'Shawn · S-08',
      },
      {
        actor: 'Owner',
        title: 'Owner dashboard',
        route: 'mylistings',
        hl: 'listing-row',
        say: 'My Listings shows the goldfish listing as reserved, with its open request.',
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
        say: 'After Priya collects the fish, Jordan confirms. The request isn’t complete until the adopter confirms too.',
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
        who: 'Midhir · M-07',
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
        say: 'Once both sides confirm, the request is completed and the listing is marked rehomed. Tom’s request is closed.',
        sys: 'Request <code>completed</code>, listing <code>rehomed</code>, other pending requests <code>declined</code>.',
        who: 'Shawn · S-07, S-08',
      },
      {
        actor: 'Anyone',
        title: 'Gone from browsing',
        route: 'browse',
        hl: 'browse-grid',
        say: 'The goldfish no longer appear in the public listings.',
        sys: 'Browse only returns active listings.',
        who: 'Shawn · S-02',
      },
      {
        actor: 'Owner',
        title: 'Kept in the owner’s history',
        route: 'mylistings',
        ui: { tab: 'rehomed' },
        hl: 'listing-row',
        say: 'The rehomed listing stays in My Listings as a record.',
        sys: 'Rehomed is a final state.',
        who: 'Shawn · S-04',
      },
    ],
  },
};
