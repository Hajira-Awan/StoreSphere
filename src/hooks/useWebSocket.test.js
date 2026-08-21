import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { isValidInventoryUpdate } from './useWebSocket';

// ---------------------------------------------------------------------------
// Mock WebSocket class — simulates the browser WebSocket API so we can test
// the hook's logic in jsdom without a real network connection.
// ---------------------------------------------------------------------------
let mockInstances = [];

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this._closed = false;
    mockInstances.push(this);
  }

  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this._lastSentData = data;
  }

  close() {
    if (this._closed) return;
    this._closed = true;
    this.readyState = MockWebSocket.CLOSED;
  }

  // --- Test helpers ---
  _simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({});
  }

  _simulateMessage(data) {
    this.onmessage?.({ data: typeof data === 'string' ? data : JSON.stringify(data) });
  }

  _simulateError() {
    this.onerror?.({ type: 'error' });
  }

  _simulateClose(code = 1006) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, reason: '' });
  }
}

// Make the constants available as instance properties too
MockWebSocket.prototype.OPEN = MockWebSocket.OPEN;
MockWebSocket.prototype.CONNECTING = MockWebSocket.CONNECTING;
MockWebSocket.prototype.CLOSING = MockWebSocket.CLOSING;
MockWebSocket.prototype.CLOSED = MockWebSocket.CLOSED;

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  mockInstances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/** Get the latest MockWebSocket instance */
function latestSocket() {
  return mockInstances[mockInstances.length - 1];
}

// We need to import useWebSocket after mocking WebSocket
async function importHook() {
  // Dynamic import so mock is in place
  const mod = await import('./useWebSocket');
  return mod.useWebSocket;
}

// ---------------------------------------------------------------------------
// isValidInventoryUpdate (pure function)
// ---------------------------------------------------------------------------
describe('isValidInventoryUpdate', () => {
  it('accepts a valid inventory:update message', () => {
    expect(isValidInventoryUpdate({
      type: 'inventory:update',
      productId: 1,
      inStock: true,
      quantity: 10,
    })).toBe(true);
  });

  it('rejects null / undefined / non-object', () => {
    expect(isValidInventoryUpdate(null)).toBe(false);
    expect(isValidInventoryUpdate(undefined)).toBe(false);
    expect(isValidInventoryUpdate('string')).toBe(false);
  });

  it('rejects wrong message type', () => {
    expect(isValidInventoryUpdate({ type: 'unknown', productId: 1, inStock: true })).toBe(false);
  });

  it('rejects missing productId', () => {
    expect(isValidInventoryUpdate({ type: 'inventory:update', inStock: true, quantity: 5 })).toBe(false);
  });

  it('rejects non-boolean inStock', () => {
    expect(isValidInventoryUpdate({ type: 'inventory:update', productId: 1, inStock: 'yes' })).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(isValidInventoryUpdate({ type: 'inventory:update', productId: 1, inStock: true, quantity: -1 })).toBe(false);
  });

  it('rejects non-finite quantity', () => {
    expect(isValidInventoryUpdate({ type: 'inventory:update', productId: 1, inStock: true, quantity: Infinity })).toBe(false);
    expect(isValidInventoryUpdate({ type: 'inventory:update', productId: 1, inStock: true, quantity: NaN })).toBe(false);
  });

  it('accepts message without quantity', () => {
    expect(isValidInventoryUpdate({ type: 'inventory:update', productId: 1, inStock: false })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// useWebSocket hook tests
// ---------------------------------------------------------------------------
describe('useWebSocket', () => {
  let useWebSocket;

  beforeEach(async () => {
    useWebSocket = await importHook();
  });

  it('connects on mount and calls onStatusChange("connecting")', () => {
    const onStatusChange = vi.fn();
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange, url: 'ws://test:4000' }));

    expect(onStatusChange).toHaveBeenCalledWith('connecting');
    expect(mockInstances.length).toBe(1);
    expect(latestSocket().url).toBe('ws://test:4000');
  });

  it('calls onStatusChange("connected") when socket opens', () => {
    const onStatusChange = vi.fn();
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange, url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
    });

    expect(onStatusChange).toHaveBeenCalledWith('connected');
  });

  // ------ Inventory update tests ------

  it('calls onMessage with correct patch for valid inventory:update', () => {
    const onStatusChange = vi.fn();
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange, url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
      latestSocket()._simulateMessage({
        type: 'inventory:update',
        productId: 42,
        inStock: false,
        quantity: 0,
      });
    });

    expect(onMessage).toHaveBeenCalledWith({
      type: 'INVENTORY_UPDATE',
      patch: { productId: 42, inStock: false, quantity: 0 },
    });
  });

  it('ignores malformed JSON messages', () => {
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange: vi.fn(), url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
      latestSocket()._simulateMessage('not valid json {{{');
    });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('ignores empty object messages', () => {
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange: vi.fn(), url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
      latestSocket()._simulateMessage({});
    });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('ignores unknown message types', () => {
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange: vi.fn(), url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
      latestSocket()._simulateMessage({ type: 'unknown' });
    });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('ignores inventory:update without productId', () => {
    const onMessage = vi.fn();

    renderHook(() => useWebSocket({ onMessage, onStatusChange: vi.fn(), url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
      latestSocket()._simulateMessage({ type: 'inventory:update' });
    });

    expect(onMessage).not.toHaveBeenCalled();
  });

  // ------ Disconnect / reconnection tests ------

  it('enters reconnecting state when socket closes unexpectedly', () => {
    const onStatusChange = vi.fn();

    renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    act(() => {
      latestSocket()._simulateOpen();
    });

    act(() => {
      latestSocket()._simulateClose();
    });

    expect(onStatusChange).toHaveBeenCalledWith('reconnecting');
  });

  it('follows exponential backoff delays: 1s, 2s, 4s, 8s, 16s, 30s max', () => {
    const onStatusChange = vi.fn();
    renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    // First connection opens and then closes
    act(() => { latestSocket()._simulateOpen(); });

    const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000];

    for (let i = 0; i < expectedDelays.length; i++) {
      const socketCountBefore = mockInstances.length;

      // Simulate unexpected close
      act(() => { latestSocket()._simulateClose(); });

      // Advance timer by just under the expected delay — no new socket should exist
      act(() => { vi.advanceTimersByTime(expectedDelays[i] - 1); });
      expect(mockInstances.length).toBe(socketCountBefore);

      // Advance the remaining 1ms — new socket should be created
      act(() => { vi.advanceTimersByTime(1); });
      expect(mockInstances.length).toBe(socketCountBefore + 1);
    }
  });

  it('resets retry counter after successful reconnection', () => {
    const onStatusChange = vi.fn();
    renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    // Open → close → backoff 1s → reconnect → open
    act(() => { latestSocket()._simulateOpen(); });
    act(() => { latestSocket()._simulateClose(); });

    // Should try at 1000ms
    act(() => { vi.advanceTimersByTime(1000); });
    const secondSocket = latestSocket();

    // Simulate successful reconnection
    act(() => { secondSocket._simulateOpen(); });

    // Now close again — backoff should restart at 1000ms (retry counter was reset)
    act(() => { secondSocket._simulateClose(); });

    const socketCountBefore = mockInstances.length;
    act(() => { vi.advanceTimersByTime(999); });
    expect(mockInstances.length).toBe(socketCountBefore); // Not yet

    act(() => { vi.advanceTimersByTime(1); });
    expect(mockInstances.length).toBe(socketCountBefore + 1); // Now reconnected at 1000ms, proving reset
  });

  it('does NOT reconnect after intentional disconnect()', () => {
    const onStatusChange = vi.fn();
    const { result } = renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    act(() => { latestSocket()._simulateOpen(); });

    // Intentionally disconnect
    act(() => { result.current.disconnect(); });

    expect(onStatusChange).toHaveBeenCalledWith('disconnected');

    const socketCount = mockInstances.length;

    // Advance time significantly — should not attempt reconnection
    act(() => { vi.advanceTimersByTime(60000); });
    expect(mockInstances.length).toBe(socketCount);
  });

  // ------ Cleanup tests ------

  it('closes the socket and clears timers on unmount', () => {
    const onStatusChange = vi.fn();
    const { unmount } = renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    act(() => { latestSocket()._simulateOpen(); });
    act(() => { latestSocket()._simulateClose(); });

    // Now there's a pending reconnect timer
    const socketCount = mockInstances.length;

    unmount();

    // Advance time — no new sockets should be created
    act(() => { vi.advanceTimersByTime(60000); });
    expect(mockInstances.length).toBe(socketCount);
  });

  it('does not continue reconnection attempts after unmount', () => {
    const onStatusChange = vi.fn();
    const { unmount } = renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange, url: 'ws://test:4000' }));

    act(() => { latestSocket()._simulateOpen(); });

    // Unmount while connected
    unmount();

    const socketCount = mockInstances.length;
    act(() => { vi.advanceTimersByTime(60000); });
    expect(mockInstances.length).toBe(socketCount);
  });

  // ------ Send tests ------

  it('send() transmits data over the open socket', () => {
    const { result } = renderHook(() => useWebSocket({ onMessage: vi.fn(), onStatusChange: vi.fn(), url: 'ws://test:4000' }));

    act(() => { latestSocket()._simulateOpen(); });

    const ws = latestSocket();
    act(() => {
      result.current.send({ type: 'inventory:update', productId: 1, inStock: true, quantity: 5 });
    });

    expect(ws._lastSentData).toBe(JSON.stringify({
      type: 'inventory:update', productId: 1, inStock: true, quantity: 5,
    }));
  });
});
