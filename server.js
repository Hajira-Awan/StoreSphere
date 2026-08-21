import { WebSocketServer } from 'ws';
import { PRODUCTS } from './src/data/products.js';

const PORT = parseInt(process.env.WS_PORT || '4000', 10);

const wss = new WebSocketServer({ port: PORT });

/** @type {Set<import('ws').WebSocket>} */
const clients = new Set();

/**
 * Broadcast a message to all connected clients.
 * Silently skips clients that are not in the OPEN state.
 */
function broadcast(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      try {
        client.send(payload);
      } catch {
        // Non-fatal: the client may have disconnected between the check and the send
      }
    }
  }
}

/**
 * Validate an incoming inventory:update message.
 * Returns an error string if invalid, or null if valid.
 */
function validateInventoryUpdate(msg) {
  if (msg.type !== 'inventory:update') return 'Unknown message type';
  if (msg.productId === undefined || msg.productId === null) return 'Missing productId';
  if (typeof msg.inStock !== 'boolean') return 'inStock must be a boolean';
  if (msg.quantity !== undefined) {
    if (typeof msg.quantity !== 'number' || !Number.isFinite(msg.quantity)) {
      return 'quantity must be a finite number';
    }
    if (msg.quantity < 0) return 'quantity must not be negative';
  }
  return null;
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  // Send handshake acknowledgement
  try {
    ws.send(JSON.stringify({ type: 'connection:ack' }));
  } catch {
    // Client may have already disconnected
  }

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      // Malformed JSON — send error, don't crash
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      } catch { /* ignore */ }
      return;
    }

    // Only handle inventory:update messages
    if (!msg || typeof msg !== 'object' || !msg.type) {
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'Missing message type' }));
      } catch { /* ignore */ }
      return;
    }

    if (msg.type === 'inventory:update') {
      const error = validateInventoryUpdate(msg);
      if (error) {
        try {
          ws.send(JSON.stringify({ type: 'error', message: error }));
        } catch { /* ignore */ }
        return;
      }

      // Broadcast the validated update to all connected clients
      broadcast({
        type: 'inventory:update',
        productId: msg.productId,
        inStock: msg.inStock,
        quantity: msg.quantity ?? (msg.inStock ? 1 : 0),
        timestamp: Date.now(),
      });
    }
    // Unknown types are silently ignored
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} remaining)`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Client error:', err.message);
    clients.delete(ws);
  });
});

// ---------------------------------------------------------------------------
// Inventory change simulator
// Generates random stock changes every 8-15 seconds so the feature is
// demonstrable without manual triggers. Mirrors the Week 3 BroadcastChannel
// simulator behavior.
// ---------------------------------------------------------------------------
function simulatorTick() {
  if (clients.size === 0) {
    // No clients connected — skip the tick but keep scheduling
    scheduleNextTick();
    return;
  }

  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const newInStock = !product.inStock;
  const patch = {
    type: 'inventory:update',
    productId: product.id,
    inStock: newInStock,
    quantity: newInStock ? Math.floor(Math.random() * 20) + 1 : 0,
    timestamp: Date.now(),
  };

  broadcast(patch);
  scheduleNextTick();
}

function scheduleNextTick() {
  const delay = 8000 + Math.random() * 7000; // 8-15 seconds
  setTimeout(simulatorTick, delay);
}

// Start the simulator after a 3-second warm-up
setTimeout(simulatorTick, 3000);

console.log(`[WS] WebSocket server running on ws://localhost:${PORT}`);
