import { PRODUCTS } from '../data/products';

const CHANNEL_NAME = 'storeSphere-inventory';

/**
 * Creates and manages a BroadcastChannel for real-time inventory updates.
 * Simulates random stock changes every 8-15 s so the feature is demonstrable
 * without a real WebSocket server.
 */
export function createInventoryChannel() {
  let channel = null;
  let simulatorInterval = null;
  let onMessage = null;

  function open(messageHandler) {
    onMessage = messageHandler;

    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (onMessage && event.data?.type === 'INVENTORY_UPDATE') {
          onMessage(event.data);
        }
      };
      channel.onmessageerror = () => {
        // Non-fatal: message couldn't be deserialized
      };
    } catch {
      // BroadcastChannel not supported — degrade gracefully
      channel = null;
    }

    return { connected: channel !== null };
  }

  function post(patch) {
    if (!channel) return;
    channel.postMessage({
      type: 'INVENTORY_UPDATE',
      patch,
      tabId: getTabId(),
      timestamp: Date.now(),
    });
  }

  function startSimulator() {
    if (simulatorInterval) return;

    function tick() {
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const newInStock = !product.inStock; // toggle
      const patch = {
        productId: product.id,
        inStock: newInStock,
        ...(newInStock ? { quantity: Math.floor(Math.random() * 20) + 1 } : { quantity: 0 }),
      };

      // Broadcast to other tabs
      post(patch);

      // Also fire locally (BroadcastChannel doesn't echo to sender)
      if (onMessage) {
        onMessage({ type: 'INVENTORY_UPDATE', patch, tabId: getTabId(), timestamp: Date.now() });
      }

      // Schedule next tick at random 8-15 s
      const nextDelay = 8000 + Math.random() * 7000;
      simulatorInterval = setTimeout(tick, nextDelay);
    }

    // First tick after an initial 3 s warm-up
    simulatorInterval = setTimeout(tick, 3000);
  }

  function stopSimulator() {
    if (simulatorInterval) {
      clearTimeout(simulatorInterval);
      simulatorInterval = null;
    }
  }

  function close() {
    stopSimulator();
    if (channel) {
      channel.close();
      channel = null;
    }
    onMessage = null;
  }

  return { open, post, close, startSimulator, stopSimulator };
}

// Stable per-tab identifier so we can ignore self-echoes if needed
let _tabId = null;
function getTabId() {
  if (!_tabId) {
    _tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return _tabId;
}
