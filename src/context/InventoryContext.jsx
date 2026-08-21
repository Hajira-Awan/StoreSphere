import { createContext, useMemo, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import { inventoryMachine } from '../machines/inventoryMachine';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

export const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [state, send] = useMachine(inventoryMachine);

  const onMessage = useCallback(
    (data) => {
      if (!data?.patch) return;

      const { productId, inStock, quantity } = data.patch;

      // --- Validation: reject invalid / duplicate updates ---
      if (productId === undefined || productId === null) return;
      if (typeof inStock !== 'boolean') return;
      if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) return;

      send({ type: 'INVENTORY_UPDATE', patch: data.patch });

      // Show a subtle toast for stock changes
      if (inStock !== undefined) {
        toast(
          inStock
            ? `Product #${productId} is back in stock!`
            : `Product #${productId} is now out of stock`,
          {
            duration: 3000,
            icon: inStock ? '📦' : '⚠️',
          }
        );
      }
    },
    [send]
  );

  const onStatusChange = useCallback(
    (status) => {
      switch (status) {
        case 'connecting':
          send({ type: 'CONNECT' });
          break;
        case 'connected':
          send({ type: 'CONNECTED' });
          break;
        case 'reconnecting':
          send({ type: 'CONNECTION_LOST' });
          break;
        case 'disconnected':
          send({ type: 'DISCONNECT' });
          break;
      }
    },
    [send]
  );

  const { disconnect, reconnect, send: wsSend } = useWebSocket({ onMessage, onStatusChange });

  // Derive connection status from machine state
  const connectionStatus = state.value; // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  const overrides = state.context.overrides;
  const retryCount = state.context.retryCount;

  /**
   * Get the real-time stock status for a product.
   * Returns the override if available, otherwise falls back to the original.
   */
  const getStockStatus = useCallback(
    (productId, originalInStock) => {
      const override = overrides[productId];
      if (override && override.inStock !== undefined) {
        return {
          inStock: override.inStock,
          quantity: override.quantity,
          isRealTime: true,
          updatedAt: override.updatedAt,
        };
      }
      return { inStock: originalInStock, isRealTime: false };
    },
    [overrides]
  );

  /**
   * Send an inventory update through the WebSocket connection.
   */
  const sendInventoryUpdate = useCallback(
    (patch) => {
      wsSend({
        type: 'inventory:update',
        productId: patch.productId,
        inStock: patch.inStock,
        quantity: patch.quantity,
      });
    },
    [wsSend]
  );

  const value = useMemo(
    () => ({
      connectionStatus,
      retryCount,
      overrides,
      getStockStatus,
      disconnect,
      reconnect,
      sendInventoryUpdate,
    }),
    [connectionStatus, retryCount, overrides, getStockStatus, disconnect, reconnect, sendInventoryUpdate]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
