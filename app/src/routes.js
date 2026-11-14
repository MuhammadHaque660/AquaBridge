/**
 * Route map (SH-04). One entry per screen: its URL pattern, who builds it, and the backlog tasks and stories it covers.
 * The build-notes strip and the screen map read from here. Use `to(name, params)` to build links.
 */
import { matchPath } from 'react-router';

export const ROUTES = {
  home: {
    path: '/',
    title: 'Home',
    owner: 'Shared · Farhan coordinates routes',
    tasks: 'SH-04',
    stories: 'CORE-003',
  },
  browse: {
    path: '/browse',
    title: 'Browse listings',
    owner: 'Shawn',
    tasks: 'S-02, S-09 (stretch)',
    stories: 'LIST-004, LIST-005, LIST-006',
  },
  editor: {
    path: '/listings/new',
    alt: ['/listings/:id/edit'],
    title: 'Listing editor',
    owner: 'Shawn',
    tasks: 'S-01, S-04',
    stories: 'LIST-001, LIST-002, LIST-003',
    auth: true,
  },
  listing: {
    path: '/listings/:id',
    title: 'Listing details',
    owner: 'Shawn + Farhan (care data)',
    tasks: 'S-03, F-05',
    stories: 'LIST-004, SPEC-002, SPEC-003',
  },
  rehome: {
    path: '/rehome',
    title: 'Rehoming questions',
    owner: 'Farhan',
    tasks: 'F-01, F-02, F-05',
    stories: 'GUID-001, GUID-002, SPEC-001',
  },
  review: { path: '/rehome/review', title: 'Check your answers', owner: 'Farhan', tasks: 'F-03', stories: 'GUID-003' },
  guidance: {
    path: '/rehome/guidance',
    title: 'Your rehoming guidance',
    owner: 'Farhan',
    tasks: 'F-04, F-06',
    stories: 'GUID-004, GUID-005, GUID-006',
  },
  signin: {
    path: '/signin',
    title: 'Sign in',
    owner: 'Shared · Farhan coordinates mock auth',
    tasks: 'SH-05',
    stories: 'REG-001, REG-002, REG-003, REG-004, REG-005',
  },
  mylistings: {
    path: '/account/listings',
    title: 'My listings',
    owner: 'Shawn',
    tasks: 'S-04, S-05',
    stories: 'LIST-003, LIST-007',
    auth: true,
  },
  incoming: {
    path: '/account/incoming',
    title: 'Requests for my listings',
    owner: 'Shawn + Midhir (habitat summary)',
    tasks: 'S-06, S-07, S-10, M-05',
    stories: 'REQ-002, REQ-003, REQ-005, REQ-006, HAB-006',
    auth: true,
  },
  habitat: {
    path: '/account/habitat',
    alt: ['/account/habitat/:edit'],
    title: 'My tanks and ponds',
    owner: 'Midhir',
    tasks: 'M-01, M-02',
    stories: 'HAB-001, HAB-002',
    auth: true,
  },
  compat: {
    path: '/check/:id',
    title: 'Compatibility check',
    owner: 'Midhir',
    tasks: 'M-03, M-04',
    stories: 'HAB-003, HAB-004, HAB-005',
    auth: true,
  },
  request: {
    path: '/request/:id/:hab',
    title: 'Request to adopt',
    owner: 'Midhir (screen) → Shawn (service)',
    tasks: 'M-06, S-08',
    stories: 'REQ-001',
    auth: true,
  },
  myrequests: {
    path: '/account/requests',
    title: 'My adoption requests',
    owner: 'Midhir',
    tasks: 'M-07, M-09',
    stories: 'REQ-004, REQ-005, REQ-006, REQ-008',
    auth: true,
  },
  species: {
    path: '/species',
    title: 'Species guide',
    owner: 'Farhan',
    tasks: 'F-08, F-05',
    stories: 'SPEC-001, SPEC-002, SPEC-003',
  },
  speciesDetail: {
    path: '/species/:id',
    title: 'Species page',
    owner: 'Farhan',
    tasks: 'F-08, F-05',
    stories: 'SPEC-002, SPEC-003',
  },
  sent: {
    path: '/account/requests/sent/:id',
    title: 'Request sent',
    owner: 'Midhir',
    tasks: 'M-06',
    stories: 'REQ-001',
    auth: true,
  },
  help: {
    path: '/how-it-works',
    title: 'How it works',
    owner: 'Shared · Farhan coordinates routes',
    tasks: 'SH-04',
    stories: 'CORE-003, GUID-006',
  },
  privacy: { path: '/privacy', title: 'Privacy', owner: 'Farhan (content pages)', tasks: 'SH-04', stories: 'CORE-001' },
  accessibility: {
    path: '/accessibility',
    title: 'Accessibility',
    owner: 'Farhan (page) · Midhir (checks)',
    tasks: 'SH-04, SH-08',
    stories: 'CORE-002',
  },
  contact: { path: '/contact', title: 'Contact', owner: 'Farhan (content pages)', tasks: 'SH-04', stories: 'CORE-003' },
  team: {
    path: '/team',
    title: 'Team reference',
    owner: 'Product Owner reference',
    tasks: 'SH-01, SH-03, SH-06',
    stories: 'All epics',
    team: true,
  },
  screen: {
    path: '/team/screens/:name',
    title: 'Screen details',
    owner: 'Product Owner reference',
    tasks: 'Per-screen build spec',
    stories: 'All epics',
    team: true,
  },
  demos: {
    path: '/team/demos',
    team: true,
    title: 'Demo flows',
    owner: 'Product Owner reference',
    tasks: 'SH-07, F-07, M-08',
    stories: 'Core journey across all epics',
  },
  map: {
    path: '/team/screens',
    team: true,
    title: 'Screen map',
    owner: 'Product Owner reference',
    tasks: 'Sprint 1 overview',
    stories: 'All epics',
  },
  design: {
    path: '/team/design',
    team: true,
    title: 'Design system',
    owner: 'Shawn proposes · Midhir coordinates',
    tasks: 'SH-02, SH-08, SH-09',
    stories: 'CORE-002, CORE-003',
  },
};

/** Build a URL for a screen. */
export function to(name, p = {}) {
  switch (name) {
    case 'listing':
      return `/listings/${p.id}`;
    case 'editor':
      return p.id ? `/listings/${p.id}/edit` : `/listings/new${p.fromIntake ? '?from=intake' : ''}`;
    case 'incoming':
      return `/account/incoming${p.listing ? `?listing=${p.listing}` : ''}`;
    case 'habitat':
      return p.edit ? `/account/habitat/${p.edit}` : '/account/habitat';
    case 'compat':
      return `/check/${p.id}${p.hab ? `?hab=${p.hab}` : ''}`;
    case 'request':
      return `/request/${p.id}/${p.hab}`;
    case 'screen':
      return `/team/screens/${p.name}`;
    case 'speciesDetail':
      return `/species/${p.id}`;
    case 'sent':
      return `/account/requests/sent/${p.id}`;
    case 'signin':
      return `/signin${p.tab ? `?tab=${p.tab}` : ''}`;
    default:
      return (ROUTES[name] || ROUTES.home).path;
  }
}

/** Which screen a pathname belongs to (for the build notes and nav highlighting). */
export function routeName(pathname) {
  for (const [name, r] of Object.entries(ROUTES)) {
    if ([r.path, ...(r.alt || [])].some((p) => matchPath({ path: p, end: true }, pathname))) return name;
  }
  return 'home';
}
