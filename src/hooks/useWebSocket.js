import { useEffect, useRef, useCallback } from 'react';
import { backoffDelay } from '../machines/inventoryMachine';

/**
 * Default WebSocket URL. In production this would point at the real
 * inventory service; for local dev it falls back to the Vite env variable
 * or the default port the companion `server.js` listens on.
 */
const DEFAULT_WS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) ||
  'ws://localhost:4000';

/**
 * Validate an incoming `inventory:update` message before it is handed to
 * consumers. Returns `true` only when the message has all required fields
 * with correct types and sane values.
 */
export function isValidInventoryUpdate(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.type !== 'inventory:update') return false;
  if (msg.productId === undefined || msg.productId === null) return false;
  if (typeof msg.inStock !== 'boolean') return false;
  if (msg.quantity !== undefined) {
    if (typeof msg.quantity !== 'number' || !Number.isFinite(msg.quantity)) return false;
    if (msg.quantity < 0) return false;
  }
  return true;
}

/**
 * useWebSocket — manages the real WebSocket connection lifecycle.
 *
 * Calls `onMessage(data)` for each validated incoming inventory:update.
 * Calls `onStatusChange(status)` when the connection state changes.
 *
 * Handles automatic reconnection with exponential backoff when the socket
 * closes unexpectedly.
 *
 * @param {{ onMessage: function, onStatusChange: function, url?: string }} opts
 * @returns {{ disconnect: function, reconnect: function, send: function }}
 */
export function useWebSocket({ onMessage, onStatusChange, url = DEFAULT_WS_URL }) {
  const socketRef = useRef(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const intentionalCloseRef = useRef(false);

  // Keep references to callbacks so callback updates don't trigger reconnection loops
  const onMessageRef = useRef(onMessage);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onStatusChangeRef.current = onStatusChange;
  }, [onMessage, onStatusChange]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Clean up any existing socket before creating a new one
    if (socketRef.current) {
      try {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
      } catch { /* ignore */ }
      socketRef.current = null;
    }

    intentionalCloseRef.current = false;
    onStatusChangeRef.current?.('connecting');

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      // WebSocket constructor can throw for invalid URLs
      onStatusChangeRef.current?.('disconnected');
      return;
    }
    socketRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      retryRef.current = 0;
      onStatusChangeRef.current?.('connected');
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;

      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        // Malformed JSON — ignore
        return;
      }

      // Only forward validated inventory:update messages
      if (isValidInventoryUpdate(msg)) {
        onMessageRef.current?.({
          type: 'INVENTORY_UPDATE',
          patch: {
            productId: msg.productId,
            inStock: msg.inStock,
            quantity: msg.quantity,
          },
        });
      }
      // All other message types (connection:ack, error, unknown) are silently ignored
    };

    ws.onerror = () => {
      // The `onclose` handler will fire after `onerror`, so we let
      // reconnection logic live there. We only need to make sure
      // we don't crash.
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      if (intentionalCloseRef.current) {
        onStatusChangeRef.current?.('disconnected');
        return;
      }

      // Unexpected close — attempt reconnection with exponential backoff
      const delay = backoffDelay(retryRef.current);
      retryRef.current += 1;
      onStatusChangeRef.current?.('reconnecting');

      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [url]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
      } catch { /* ignore */ }
      socketRef.current = null;
    }

    onStatusChangeRef.current?.('disconnected');
  }, []);

  const send = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      // Clean up timers
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      // Close socket without triggering reconnect
      intentionalCloseRef.current = true;
      if (socketRef.current) {
        try {
          socketRef.current.onopen = null;
          socketRef.current.onmessage = null;
          socketRef.current.onerror = null;
          socketRef.current.onclose = null;
          socketRef.current.close();
        } catch { /* ignore */ }
        socketRef.current = null;
      }
    };
  }, [connect]);

  return { disconnect, reconnect: connect, send };
}
