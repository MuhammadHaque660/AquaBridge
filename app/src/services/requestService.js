/**
 * Mock RequestService (S-08, Shawn). The one place request state changes.
 * Every function takes the app state `s` (a draft copy from store.update) and mutates it,
 * or throws an Error whose message is shown to the user. A real API replaces this in Sprint 2.
 */
import { byId, today } from './seed';
import { safeSummary } from '../features/habitat/compat';

const listingOf = (s, r) => byId(s.listings, r.listingId);

export function submit(s, { listingId, adopterId, habitatId, intro, compat }) {
  const l = byId(s.listings, listingId);
  if (!l || l.status !== 'active') throw new Error('This listing is no longer accepting requests.');
  if (l.owner === adopterId) throw new Error('You cannot request your own listing.');
  if (compat !== 'potential_match') throw new Error('Only a potential match can be sent to the owner.');
  if (
    s.requests.some(
      (r) => r.listingId === listingId && r.adopter === adopterId && ['pending', 'accepted'].includes(r.status),
    )
  )
    throw new Error('You already have an open request for this listing.');
  const r = {
    id: 'R-' + s.seq.request++,
    listingId,
    adopter: adopterId,
    habitatId,
    compat,
    intro,
    status: 'pending',
    ownerConfirmed: false,
    adopterConfirmed: false,
    created: today(),
    summary: safeSummary(byId(s.habitats, habitatId)),
  };
  s.requests.unshift(r);
  return r;
}

export const listForOwner = (s, ownerId) => s.requests.filter((r) => listingOf(s, r)?.owner === ownerId);
export const listForAdopter = (s, adopterId) => s.requests.filter((r) => r.adopter === adopterId);

export function withdraw(s, id, by) {
  const r = byId(s.requests, id);
  if (r.adopter !== by || r.status !== 'pending') throw new Error('Only a pending request can be withdrawn.');
  r.status = 'withdrawn';
}

export function accept(s, id, by) {
  const r = byId(s.requests, id);
  const l = listingOf(s, r);
  if (l.owner !== by) throw new Error('Only the listing owner can accept.');
  if (s.requests.some((x) => x.listingId === l.id && x.status === 'accepted'))
    throw new Error('This listing already has an accepted request.');
  r.status = 'accepted';
  l.status = 'reserved';
}

export function decline(s, id, by) {
  const r = byId(s.requests, id);
  if (listingOf(s, r).owner !== by) throw new Error('Only the listing owner can decline.');
  r.status = 'declined';
}

export function confirmHandover(s, id, by) {
  const r = byId(s.requests, id);
  const l = listingOf(s, r);
  if (r.status !== 'accepted') throw new Error('Handover can only be confirmed on an accepted request.');
  if (l.owner === by) r.ownerConfirmed = true;
  else if (r.adopter === by) r.adopterConfirmed = true;
  else throw new Error('You are not part of this request.');
  if (r.ownerConfirmed && r.adopterConfirmed) {
    r.status = 'completed';
    l.status = 'rehomed';
    s.requests.forEach((x) => {
      if (x.listingId === l.id && x.status === 'pending') x.status = 'declined';
    });
  }
}
