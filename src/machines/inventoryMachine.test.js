import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { inventoryMachine, backoffDelay } from './inventoryMachine';

describe('backoffDelay', () => {
  it('starts at 1 second for retry 0', () => {
    expect(backoffDelay(0)).toBe(1000);
  });

  it('doubles each retry', () => {
    expect(backoffDelay(1)).toBe(2000);
    expect(backoffDelay(2)).toBe(4000);
    expect(backoffDelay(3)).toBe(8000);
    expect(backoffDelay(4)).toBe(16000);
  });

  it('caps at 30 seconds', () => {
    expect(backoffDelay(5)).toBe(30000); // 2^5 * 1000 = 32000, capped to 30000
    expect(backoffDelay(10)).toBe(30000);
    expect(backoffDelay(99)).toBe(30000);
  });
});

describe('inventoryMachine', () => {
  function createTestActor() {
    const actor = createActor(inventoryMachine);
    actor.start();
    return actor;
  }

  it('starts in disconnected state with empty overrides', () => {
    const actor = createTestActor();
    expect(actor.getSnapshot().value).toBe('disconnected');
    expect(actor.getSnapshot().context.overrides).toEqual({});
    expect(actor.getSnapshot().context.retryCount).toBe(0);
    actor.stop();
  });

  it('transitions disconnected → connecting on CONNECT', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    expect(actor.getSnapshot().value).toBe('connecting');
    actor.stop();
  });

  it('transitions connecting → connected on CONNECTED and resets retryCount', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED' });
    expect(actor.getSnapshot().value).toBe('connected');
    expect(actor.getSnapshot().context.retryCount).toBe(0);
    actor.stop();
  });

  it('transitions connecting → reconnecting on ERROR (with retries remaining)', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'ERROR', error: 'Network error' });
    expect(actor.getSnapshot().value).toBe('reconnecting');
    expect(actor.getSnapshot().context.retryCount).toBe(1);
    expect(actor.getSnapshot().context.lastError).toBe('Network error');
    actor.stop();
  });

  it('applies inventory patches in connected state', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED' });

    actor.send({
      type: 'INVENTORY_UPDATE',
      patch: { productId: 42, inStock: false, quantity: 0 },
    });

    const overrides = actor.getSnapshot().context.overrides;
    expect(overrides[42]).toBeDefined();
    expect(overrides[42].inStock).toBe(false);
    expect(overrides[42].quantity).toBe(0);
    expect(overrides[42].updatedAt).toBeGreaterThan(0);
    actor.stop();
  });

  it('applies inventory patches in reconnecting state', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'ERROR', error: 'timeout' });

    actor.send({
      type: 'INVENTORY_UPDATE',
      patch: { productId: 7, inStock: true, quantity: 5 },
    });

    expect(actor.getSnapshot().context.overrides[7].inStock).toBe(true);
    actor.stop();
  });

  it('accumulates multiple patches for different products', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED' });

    actor.send({ type: 'INVENTORY_UPDATE', patch: { productId: 1, inStock: true } });
    actor.send({ type: 'INVENTORY_UPDATE', patch: { productId: 2, inStock: false } });
    actor.send({ type: 'INVENTORY_UPDATE', patch: { productId: 1, inStock: false } });

    const overrides = actor.getSnapshot().context.overrides;
    expect(overrides[1].inStock).toBe(false); // latest wins
    expect(overrides[2].inStock).toBe(false);
    actor.stop();
  });

  it('resets retryCount on CONNECTED after reconnecting', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'ERROR', error: 'err' });
    actor.send({ type: 'ERROR', error: 'err' });
    expect(actor.getSnapshot().context.retryCount).toBe(2);

    actor.send({ type: 'CONNECTED' });
    expect(actor.getSnapshot().value).toBe('connected');
    expect(actor.getSnapshot().context.retryCount).toBe(0);
    expect(actor.getSnapshot().context.lastError).toBeNull();
    actor.stop();
  });

  it('transitions connected → disconnected on DISCONNECT', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED' });
    actor.send({ type: 'DISCONNECT' });
    expect(actor.getSnapshot().value).toBe('disconnected');
    actor.stop();
  });

  it('transitions connected → reconnecting on CONNECTION_LOST', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    actor.send({ type: 'CONNECTED' });
    actor.send({ type: 'CONNECTION_LOST', error: 'Socket closed' });

    expect(actor.getSnapshot().value).toBe('reconnecting');
    expect(actor.getSnapshot().context.retryCount).toBe(1);
    actor.stop();
  });

  it('falls back to disconnected after max retries exceeded', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });

    // Guard checks retryCount < 10 BEFORE incrementing, so we need 11 ERRORs:
    // ERROR #1 (retryCount=0, passes) → reconnecting, retryCount=1
    // ...
    // ERROR #10 (retryCount=9, passes) → reconnecting, retryCount=10
    // ERROR #11 (retryCount=10, fails) → disconnected
    for (let i = 0; i < 11; i++) {
      actor.send({ type: 'ERROR', error: `retry ${i}` });
    }
    expect(actor.getSnapshot().value).toBe('disconnected');
    expect(actor.getSnapshot().context.retryCount).toBe(10);
    actor.stop();
  });

  it('clears error on CONNECT from disconnected', () => {
    const actor = createTestActor();
    actor.send({ type: 'CONNECT' });
    // Exhaust retries to get to disconnected with an error (11 ERRORs needed)
    for (let i = 0; i < 11; i++) {
      actor.send({ type: 'ERROR', error: 'fail' });
    }
    expect(actor.getSnapshot().context.lastError).toBe('fail');

    actor.send({ type: 'CONNECT' });
    expect(actor.getSnapshot().value).toBe('connecting');
    expect(actor.getSnapshot().context.lastError).toBeNull();
    actor.stop();
  });
});
