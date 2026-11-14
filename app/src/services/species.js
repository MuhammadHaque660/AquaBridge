/**
 * Species catalogue (F-05, Farhan). Sample reference data, not verified by a specialist.
 * Other features read species only through getSpecies / listSpecies.
 */
export const SPECIES = {
  'SP-001': {
    common: 'Fancy goldfish',
    sci: 'Carassius auratus',
    kind: 'animal',
    group: 'cold',
    habitats: ['aquarium'],
    temp: [10, 24],
    ph: [7.0, 8.0],
    minVol: 110,
    filter: true,
    cycled: true,
    status: 'supported',
    care: 'Coldwater fish that produce a lot of waste. Needs strong filtration and weekly partial water changes. Fancy varieties do better indoors than in ponds.',
  },
  'SP-002': {
    common: 'Neon tetra',
    sci: 'Paracheirodon innesi',
    kind: 'animal',
    group: 'trop',
    habitats: ['aquarium'],
    temp: [20, 26],
    ph: [6.0, 7.0],
    minVol: 54,
    filter: true,
    cycled: true,
    status: 'supported',
    care: 'Shoaling fish. Keep in groups of six or more in a heated, planted tank with soft water.',
  },
  'SP-003': {
    common: 'Cherry shrimp',
    sci: 'Neocaridina davidi',
    kind: 'animal',
    group: 'trop',
    habitats: ['aquarium'],
    temp: [18, 26],
    ph: [6.5, 8.0],
    minVol: 20,
    filter: true,
    cycled: true,
    status: 'supported',
    care: 'Peaceful and hardy. Sensitive to copper-based medicines and to sudden changes in water chemistry.',
  },
  'SP-004': {
    common: 'White Cloud Mountain minnow',
    sci: 'Tanichthys albonubes',
    kind: 'animal',
    group: 'cold',
    habitats: ['aquarium'],
    temp: [14, 22],
    ph: [6.5, 8.0],
    minVol: 60,
    filter: true,
    cycled: true,
    status: 'supported',
    care: 'Coldwater shoaling fish. Does not need a heater in most UK homes. Keep in groups of six or more.',
  },
  'SP-005': {
    common: 'Java fern',
    sci: 'Microsorum pteropus',
    kind: 'plant',
    group: 'plant',
    habitats: ['aquarium'],
    temp: [18, 28],
    ph: [6.0, 7.5],
    minVol: 20,
    light: 'low',
    status: 'supported',
    care: 'Slow-growing. Tie the rhizome to wood or rock; burying it in gravel causes rot.',
  },
  'SP-006': {
    common: 'Hornwort',
    sci: 'Ceratophyllum demersum',
    kind: 'plant',
    group: 'plant',
    habitats: ['aquarium', 'pond'],
    temp: [4, 28],
    ph: [6.0, 8.0],
    minVol: 20,
    light: 'medium',
    status: 'supported',
    care: 'Native to the UK. Fast-growing oxygenator that can float or be anchored.',
  },
  'SP-007': {
    common: 'Hardy water lily',
    sci: 'Nymphaea (hardy cultivars)',
    kind: 'plant',
    group: 'pond',
    habitats: ['pond'],
    temp: [4, 30],
    ph: [6.5, 8.0],
    minVol: 500,
    minDepth: 30,
    light: 'high',
    status: 'supported',
    care: 'Pond only. Plant in an aquatic basket 30 to 90 cm deep, in full sun.',
  },
  'SP-008': {
    common: 'Red-eared slider',
    sci: 'Trachemys scripta elegans',
    kind: 'animal',
    group: 'cold',
    status: 'restricted',
    care: 'Example restricted species. Listed as an invasive species of special concern in England and Wales; selling, exchanging and releasing it are restricted.',
  },
  'SP-009': {
    common: "Parrot's feather",
    sci: 'Myriophyllum aquaticum',
    kind: 'plant',
    group: 'plant',
    status: 'restricted',
    care: 'Example restricted species. Listed as an invasive non-native plant in England and Wales and banned from sale.',
  },
  'SP-000': {
    common: "I'm not sure what it is",
    sci: 'Unidentified',
    kind: 'any',
    group: 'cold',
    status: 'unknown',
    care: 'We cannot give care guidance until the organism is identified.',
  },
};

export const getSpecies = (id) => SPECIES[id];

/** Species a user can pick for a given kind ('animal' | 'plant'), including the "not sure" option. */
export const listSpecies = (kind) =>
  Object.entries(SPECIES)
    .filter(([, s]) => s.kind === kind || s.kind === 'any')
    .map(([id, s]) => ({ id, ...s }));

export const supportedSpecies = () =>
  Object.entries(SPECIES)
    .filter(([, s]) => s.status === 'supported')
    .map(([id, s]) => ({ id, ...s }));

/** The species for a listing, falling back to "unidentified". */
export const speciesFor = (listing) => SPECIES[listing?.speciesId] || SPECIES['SP-000'];
