import { setup, assign } from 'xstate';

/**
 * Computes the exponential backoff delay in ms.
 * Starts at 1 s, doubles each retry, caps at 30 s.
 */
export function backoffDelay(retryCount) {
  return Math.min(1000 * Math.pow(2, retryCount), 30_000);
}

export const inventoryMachine = setup({
  types: {
    context: {},
    events: {},
  },
  actions: {
    applyPatch: assign({
      overrides: ({ context, event }) => {
        const { productId, inStock, quantity } = event.patch;
        return {
          ...context.overrides,
          [productId]: {
            inStock,
            ...(quantity !== undefined ? { quantity } : {}),
            updatedAt: Date.now(),
          },
        };
      },
    }),
    incrementRetry: assign({
      retryCount: ({ context }) => context.retryCount + 1,
    }),
    resetRetry: assign({
      retryCount: () => 0,
    }),
    setError: assign({
      lastError: ({ event }) => event.error || 'Connection lost',
    }),
    clearError: assign({
      lastError: () => null,
    }),
  },
  guards: {
    canRetry: ({ context }) => context.retryCount < 10,
  },
}).createMachine({
  id: 'inventory',
  initial: 'disconnected',
  context: {
    overrides: {},   // { [productId]: { inStock, quantity?, updatedAt } }
    retryCount: 0,
    lastError: null,
  },
  states: {
    disconnected: {
      on: {
        CONNECT: {
          target: 'connecting',
          actions: 'clearError',
        },
      },
    },
    connecting: {
      on: {
        CONNECTED: {
          target: 'connected',
          actions: 'resetRetry',
        },
        ERROR: [
          {
            guard: 'canRetry',
            target: 'reconnecting',
            actions: ['setError', 'incrementRetry'],
          },
          {
            target: 'disconnected',
            actions: 'setError',
          },
        ],
      },
    },
    connected: {
      on: {
        INVENTORY_UPDATE: {
          actions: 'applyPatch',
        },
        DISCONNECT: {
          target: 'disconnected',
        },
        CONNECTION_LOST: [
          {
            guard: 'canRetry',
            target: 'reconnecting',
            actions: ['setError', 'incrementRetry'],
          },
          {
            target: 'disconnected',
            actions: 'setError',
          },
        ],
      },
    },
    reconnecting: {
      on: {
        CONNECTED: {
          target: 'connected',
          actions: ['resetRetry', 'clearError'],
        },
        ERROR: [
          {
            guard: 'canRetry',
            target: 'reconnecting',
            actions: ['setError', 'incrementRetry'],
          },
          {
            target: 'disconnected',
            actions: 'setError',
          },
        ],
        INVENTORY_UPDATE: {
          actions: 'applyPatch',
        },
        DISCONNECT: {
          target: 'disconnected',
        },
      },
    },
  },
});
