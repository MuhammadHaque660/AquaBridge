import { beforeEach, describe, expect, it } from 'vitest';
import * as RequestService from './requestService';
import { byId, seed } from './seed';

let s;
beforeEach(() => {
  s = seed();
});

describe('RequestService', () => {
  it('submits a request for an active listing', () => {
    const r = RequestService.submit(s, {
      listingId: 'L-1044',
      adopterId: 'U-01',
      habitatId: 'H-203',
      intro: 'Hello there, I have a tank ready.',
      compat: 'potential_match',
    });
    expect(r.id).toBe('R-512');
    expect(r.status).toBe('pending');
    expect(r.summary).not.toHaveProperty('name');
    expect(s.requests[0]).toBe(r);
  });

  it('rejects a request that is not a potential match', () => {
    expect(() =>
      RequestService.submit(s, {
        listingId: 'L-1044',
        adopterId: 'U-01',
        habitatId: 'H-203',
        intro: 'x',
        compat: 'blocked',
      }),
    ).toThrow('Only a potential match');
  });

  it('rejects requesting your own listing and duplicates', () => {
    expect(() =>
      RequestService.submit(s, {
        listingId: 'L-1042',
        adopterId: 'U-01',
        habitatId: 'H-201',
        intro: 'x',
        compat: 'potential_match',
      }),
    ).toThrow('your own listing');
    expect(() =>
      RequestService.submit(s, {
        listingId: 'L-1045',
        adopterId: 'U-01',
        habitatId: 'H-201',
        intro: 'x',
        compat: 'potential_match',
      }),
    ).toThrow('already have an open request');
  });

  it('accepting reserves the listing and allows only one accepted request', () => {
    RequestService.accept(s, 'R-501', 'U-01');
    expect(byId(s.requests, 'R-501').status).toBe('accepted');
    expect(byId(s.listings, 'L-1042').status).toBe('reserved');
    expect(() => RequestService.accept(s, 'R-502', 'U-01')).toThrow('already has an accepted request');
  });

  it('only the owner can accept or decline', () => {
    expect(() => RequestService.accept(s, 'R-501', 'U-03')).toThrow('Only the listing owner');
    expect(() => RequestService.decline(s, 'R-501', 'U-04')).toThrow('Only the listing owner');
  });

  it('completes only when both sides confirm the handover', () => {
    RequestService.accept(s, 'R-501', 'U-01');
    RequestService.confirmHandover(s, 'R-501', 'U-01');
    expect(byId(s.requests, 'R-501').status).toBe('accepted');
    RequestService.confirmHandover(s, 'R-501', 'U-03');
    expect(byId(s.requests, 'R-501').status).toBe('completed');
    expect(byId(s.listings, 'L-1042').status).toBe('rehomed');
    expect(byId(s.requests, 'R-502').status).toBe('declined');
  });

  it('withdraw works only on your own pending request', () => {
    expect(() => RequestService.withdraw(s, 'R-511', 'U-01')).toThrow('Only a pending request');
    RequestService.withdraw(s, 'R-510', 'U-01');
    expect(byId(s.requests, 'R-510').status).toBe('withdrawn');
  });
});
