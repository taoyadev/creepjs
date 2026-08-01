import { describe, it, expect } from 'vitest';
import { createMockQuotaNamespace, createTestEnv } from './utils';
import { releaseQuota, reserveQuota } from '../src/utils/quota';
import { normalizeEmailIdentity } from '../src/utils/email';

describe('atomic quota counters', () => {
  it('admits exactly up to the limit', async () => {
    const env = createTestEnv();
    const results = [];
    for (let i = 0; i < 4; i++) {
      results.push(await reserveQuota(env, 'k', { limit: 3 }));
    }

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[2].count).toBe(3);
    // A denied reservation must not consume budget.
    expect(results[3].count).toBe(3);
  });

  it('does not let a concurrent burst pass the limit', async () => {
    // The KV read-modify-write this replaces let every request in a burst read
    // the same pre-increment count, so all of them were admitted.
    const env = createTestEnv();
    const burst = await Promise.all(
      Array.from({ length: 25 }, () => reserveQuota(env, 'burst', { limit: 5 }))
    );

    expect(burst.filter((r) => r.allowed)).toHaveLength(5);
    const final = await reserveQuota(env, 'burst', { limit: 5 });
    expect(final.allowed).toBe(false);
    expect(final.count).toBe(5);
  });

  it('keeps counters independent per key', async () => {
    const env = createTestEnv();
    await reserveQuota(env, 'a', { limit: 1 });
    const other = await reserveQuota(env, 'b', { limit: 1 });
    expect(other.allowed).toBe(true);
  });

  it('returns refunded budget to the window', async () => {
    const env = createTestEnv();
    await reserveQuota(env, 'refund', { limit: 1 });
    expect((await reserveQuota(env, 'refund', { limit: 1 })).allowed).toBe(
      false
    );

    await releaseQuota(env, 'refund');
    expect((await reserveQuota(env, 'refund', { limit: 1 })).allowed).toBe(
      true
    );
  });

  it('never refunds below zero', async () => {
    const env = createTestEnv();
    await releaseQuota(env, 'floor');
    await releaseQuota(env, 'floor');
    const after = await reserveQuota(env, 'floor', { limit: 2 });
    expect(after.count).toBe(1);
  });

  it('starts a fresh window once the old one expires', async () => {
    const env = { ...createTestEnv(), QUOTA: createMockQuotaNamespace() };
    const first = await reserveQuota(env, 'roll', { limit: 1, windowMs: 1 });
    expect(first.allowed).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 5));

    const second = await reserveQuota(env, 'roll', { limit: 1, windowMs: 1 });
    expect(second.allowed).toBe(true);
    expect(second.count).toBe(1);
  });
});

describe('email identity', () => {
  it('collapses sub-addressing and case', () => {
    expect(normalizeEmailIdentity('User+tag@Example.com')).toBe(
      'user@example.com'
    );
  });

  it('collapses gmail dots', () => {
    expect(normalizeEmailIdentity('a.b.c@gmail.com')).toBe('abc@gmail.com');
    expect(normalizeEmailIdentity('a.b.c@googlemail.com')).toBe(
      'abc@gmail.com'
    );
  });

  it('keeps dots significant outside gmail', () => {
    // Other providers treat dots as part of the address.
    expect(normalizeEmailIdentity('a.b@fastmail.com')).toBe('a.b@fastmail.com');
  });

  it('leaves an address without a local part alone', () => {
    expect(normalizeEmailIdentity('+tag@example.com')).toBe('+tag@example.com');
  });
});
