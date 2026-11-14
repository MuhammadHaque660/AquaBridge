/**
 * Shared contracts (SH-03). Every feature reads status values, labels and data shapes from here.
 * Change a value here and tell the team: listings, guidance and habitat all depend on it.
 *
 * ID prefixes: SP-### species · IC-### intake · L-#### listing · H-### habitat · R-### request · U-## user
 */

export const LISTING_STATUS = ['draft', 'active', 'reserved', 'rehomed', 'withdrawn'];
export const REQUEST_STATUS = ['pending', 'accepted', 'declined', 'withdrawn', 'completed'];
export const COMPAT_OUTCOME = ['potential_match', 'needs_information', 'blocked'];
export const GUIDANCE_OUTCOME = ['eligible', 'needs_review', 'restricted'];

export const CONDITION = { healthy: 'Healthy', minor: 'Minor issues', unwell: 'Unwell or under treatment' };
export const URGENCY = { week: 'Within a week', month: 'Within a month', flexible: 'No rush' };
export const REASON = {
  moving: 'Moving home',
  closing: 'Closing down the tank or pond',
  outgrown: 'Outgrown the setup',
  time: 'No longer have time',
  other: 'Something else',
};
export const GROUP_LABEL = { trop: 'Tropical', cold: 'Coldwater', plant: 'Aquarium plant', pond: 'Pond plant' };

/** Sample users. ME is the signed-in sample account (Jordan Lee). */
export const USERS = {
  'U-01': { name: 'Jordan Lee', short: 'Jordan L.' },
  'U-03': { name: 'Priya Nair', short: 'Priya N.' },
  'U-04': { name: 'Tom Hughes', short: 'Tom H.' },
  'U-05': { name: 'Aisha Bello', short: 'Aisha B.' },
  'U-06': { name: 'Daniel Kerr', short: 'Daniel K.' },
};
export const ME = 'U-01';

/**
 * @typedef {'draft'|'active'|'reserved'|'rehomed'|'withdrawn'} ListingStatus
 * @typedef {'pending'|'accepted'|'declined'|'withdrawn'|'completed'} RequestStatus
 * @typedef {'potential_match'|'needs_information'|'blocked'} CompatOutcome
 * @typedef {'eligible'|'needs_review'|'restricted'} GuidanceOutcome
 *
 * @typedef {Object} Listing
 * @property {string} id            L-####
 * @property {string} owner         U-##
 * @property {string} speciesId     SP-###
 * @property {string} title
 * @property {number} qty
 * @property {string} location      Town and postcode district only, e.g. "Uxbridge, UB8"
 * @property {'healthy'|'minor'|'unwell'} condition
 * @property {'week'|'month'|'flexible'} urgency
 * @property {ListingStatus} status
 * @property {string} created       Display date, e.g. "3 Nov 2026"
 * @property {string} description
 * @property {string} careNotes
 * @property {string|null} [intakeId] IC-### when created from the guided questions
 *
 * @typedef {Object} HabitatProfile
 * @property {string} id            H-###
 * @property {string} owner         U-##
 * @property {string} name          Private to the owner
 * @property {'aquarium'|'pond'} type
 * @property {number|''} volume     Litres
 * @property {number|''} tempMin    °C
 * @property {number|''} tempMax    °C
 * @property {number|''} ph
 * @property {'yes'|'no'|''} filter
 * @property {'yes'|'no'|'unsure'|''} cycled
 * @property {number|''} depth      cm, ponds only
 * @property {'low'|'medium'|'high'} light
 * @property {string} inhabitants
 *
 * @typedef {Omit<HabitatProfile, 'id'|'owner'|'name'|'light'>} HabitatSummary  Owner-safe copy sent with a request
 *
 * @typedef {Object} AdoptionRequest
 * @property {string} id            R-###
 * @property {string} listingId
 * @property {string} adopter       U-##
 * @property {string} habitatId
 * @property {CompatOutcome} compat
 * @property {RequestStatus} status
 * @property {boolean} ownerConfirmed
 * @property {boolean} adopterConfirmed
 * @property {string} created
 * @property {string} intro
 * @property {HabitatSummary} [summary]
 */
