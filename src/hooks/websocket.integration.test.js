import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Integration tests for real WebSocket multi-client synchronization.
 *
 * These tests spin up an actual ws.Server in-process and connect
 * real WebSocket clients (using the `ws` library as both server and client)
 * to verify that inventory broadcasts propagate to all connected clients.
 */

const TEST_PORT = 4321;

/** Promisified helper: wait for a client to receive a message. */
function waitForMessage(ws, { timeout = 3000 } = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for message')), timeout);
    const handler = (raw) => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(raw.toString()));
      } catch {
        resolve(raw.toString());
      }
    };
    ws.once('message', handler);
  });
}

describe('WebSocket integration — multi-client sync', () => {
  /** @type {WebSocketServer} */
  let wss;
  /** @type {Set<WebSocket>} */
  const serverClients = new Set();
  /** @type {WebSocket[]} */
  let testClients = [];

  function broadcast(data) {
    const payload = JSON.stringify(data);
    for (const client of serverClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  function validateInventoryUpdate(msg) {
    if (msg.type !== 'inventory:update') return 'Unknown type';
    if (msg.productId === undefined || msg.productId === null) return 'Missing productId';
    if (typeof msg.inStock !== 'boolean') return 'inStock must be boolean';
    if (msg.quantity !== undefined && (typeof msg.quantity !== 'number' || msg.quantity < 0)) {
      return 'Invalid quantity';
    }
    return null;
  }

  beforeAll(async () => {
    wss = new WebSocketServer({ port: TEST_PORT });

    wss.on('connection', (ws) => {
      serverClients.add(ws);
      ws.send(JSON.stringify({ type: 'connection:ack' }));

      ws.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw.toString()); } catch { return; }
        if (!msg || !msg.type) return;

        if (msg.type === 'inventory:update') {
          const err = validateInventoryUpdate(msg);
          if (err) {
            ws.send(JSON.stringify({ type: 'error', message: err }));
            return;
          }
          broadcast({
            type: 'inventory:update',
            productId: msg.productId,
            inStock: msg.inStock,
            quantity: msg.quantity ?? (msg.inStock ? 1 : 0),
            timestamp: Date.now(),
          });
        }
      });

      ws.on('close', () => serverClients.delete(ws));
      ws.on('error', () => serverClients.delete(ws));
    });

    await new Promise((resolve) => {
      if (wss.address()) return resolve();
      wss.once('listening', resolve);
    });
  });

  afterEach(() => {
    for (const client of testClients) {
      if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
        client.close();
      }
    }
    testClients = [];
  });

  afterAll(async () => {
    for (const client of serverClients) {
      client.close();
    }
    serverClients.clear();
    await new Promise((resolve) => wss.close(resolve));
  });

  /** Create and track a new test client, waiting for connection:ack */
  function createClient() {
    return new Promise((resolve, reject) => {
      const client = new WebSocket(`ws://localhost:${TEST_PORT}`);
      testClients.push(client);

      const timer = setTimeout(() => reject(new Error('Client connect timeout')), 3000);

      client.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'connection:ack') {
            clearTimeout(timer);
            resolve(client);
          }
        } catch { /* ignore */ }
      });

      client.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  // ------------------------------------------------------------------
  // Connection tests
  // ------------------------------------------------------------------

  it('client connects successfully and receives connection:ack', async () => {
    const client = await createClient();
    expect(client.readyState).toBe(WebSocket.OPEN);
  });

  it('server tracks multiple connected clients', async () => {
    const clientA = await createClient();
    expect(serverClients.size).toBeGreaterThanOrEqual(1);

    const clientB = await createClient();
    expect(serverClients.size).toBeGreaterThanOrEqual(2);

    expect(clientA.readyState).toBe(WebSocket.OPEN);
    expect(clientB.readyState).toBe(WebSocket.OPEN);
  });

  // ------------------------------------------------------------------
  // Multi-client inventory synchronization
  // ------------------------------------------------------------------

  it('Client A sends inventory update → Client B receives it', async () => {
    const clientA = await createClient();
    const clientB = await createClient();

    const update = {
      type: 'inventory:update',
      productId: 42,
      inStock: false,
      quantity: 0,
    };

    const msgPromise = waitForMessage(clientB);
    clientA.send(JSON.stringify(update));

    const received = await msgPromise;
    expect(received.type).toBe('inventory:update');
    expect(received.productId).toBe(42);
    expect(received.inStock).toBe(false);
    expect(received.quantity).toBe(0);
  });

  it('both Client A and Client B receive the broadcast', async () => {
    const clientA = await createClient();
    const clientB = await createClient();

    const msgPromiseA = waitForMessage(clientA);
    const msgPromiseB = waitForMessage(clientB);

    clientA.send(JSON.stringify({
      type: 'inventory:update',
      productId: 7,
      inStock: true,
      quantity: 15,
    }));

    const [receivedA, receivedB] = await Promise.all([msgPromiseA, msgPromiseB]);

    expect(receivedA.productId).toBe(7);
    expect(receivedA.inStock).toBe(true);
    expect(receivedA.quantity).toBe(15);

    expect(receivedB.productId).toBe(7);
    expect(receivedB.inStock).toBe(true);
    expect(receivedB.quantity).toBe(15);
  });

  it('three clients all receive the same broadcast', async () => {
    const clientA = await createClient();
    const clientB = await createClient();
    const clientC = await createClient();

    const promises = [
      waitForMessage(clientA),
      waitForMessage(clientB),
      waitForMessage(clientC),
    ];

    clientA.send(JSON.stringify({
      type: 'inventory:update',
      productId: 99,
      inStock: true,
      quantity: 3,
    }));

    const results = await Promise.all(promises);
    for (const msg of results) {
      expect(msg.type).toBe('inventory:update');
      expect(msg.productId).toBe(99);
      expect(msg.quantity).toBe(3);
    }
  });

  // ------------------------------------------------------------------
  // Disconnect handling
  // ------------------------------------------------------------------

  it('server removes disconnected clients from the set', async () => {
    const client = await createClient();
    const sizeBefore = serverClients.size;

    client.close();
    await new Promise((r) => setTimeout(r, 100));

    expect(serverClients.size).toBe(sizeBefore - 1);
  });

  it('server does not crash when a client disconnects unexpectedly', async () => {
    const clientA = await createClient();
    const clientB = await createClient();

    clientA.terminate();
    await new Promise((r) => setTimeout(r, 100));

    const msgPromise = waitForMessage(clientB);
    clientB.send(JSON.stringify({
      type: 'inventory:update',
      productId: 1,
      inStock: true,
      quantity: 10,
    }));

    const received = await msgPromise;
    expect(received.productId).toBe(1);
  });

  // ------------------------------------------------------------------
  // Invalid message handling
  // ------------------------------------------------------------------

  it('server ignores malformed JSON gracefully', async () => {
    const client = await createClient();

    client.send('not valid json {{{');

    const client2 = await createClient();
    expect(client2.readyState).toBe(WebSocket.OPEN);
  });

  it('server rejects inventory:update with missing productId', async () => {
    const client = await createClient();

    const msgPromise = waitForMessage(client);
    client.send(JSON.stringify({ type: 'inventory:update', inStock: true, quantity: 5 }));

    const received = await msgPromise;
    expect(received.type).toBe('error');
  });
});
