import { setup, assign } from 'xstate';

export const cartMachine = setup({
  types: {
    context: {},
    events: {}
  },
  actions: {
    addItem: assign({
      items: ({ context, event }) => {
        const { product, quantity = 1 } = event;
        const currentItem = context.items[product.id];
        return {
          ...context.items,
          [product.id]: {
            product,
            quantity: currentItem ? currentItem.quantity + quantity : quantity
          }
        };
      },
      lastError: null
    }),
    removeItem: assign({
      items: ({ context, event }) => {
        const { productId } = event;
        const { [productId]: _removed, ...rest } = context.items;
        return rest;
      },
      lastError: null
    }),
    updateQuantity: assign({
      items: ({ context, event }) => {
        const { productId, quantity } = event;
        const currentItem = context.items[productId];
        if (!currentItem) return context.items;
        
        return {
          ...context.items,
          [productId]: {
            ...currentItem,
            quantity
          }
        };
      },
      lastError: null
    }),
    clearCart: assign({
      items: () => ({}),
      lastError: null
    }),
    setValidationError: assign({
      lastError: () => 'Invalid quantity'
    })
  },
  guards: {
    isValidQuantity: ({ event }) => {
      // Must be a positive integer
      return event.quantity >= 1;
    },
    hasNoItems: ({ context, event }) => {
      if (event.type === 'REMOVE_ITEM') {
        const keys = Object.keys(context.items);
        return keys.length === 1 && keys[0] === event.productId;
      }
      return Object.keys(context.items).length === 0;
    }
  }
}).createMachine({
  id: 'cart',
  initial: 'empty',
  context: {
    items: {}, // { [productId]: { product, quantity } }
    lastError: null
  },
  states: {
    empty: {
      on: {
        ADD_ITEM: {
          target: 'hasItems',
          actions: 'addItem'
        }
      }
    },
    hasItems: {
      on: {
        ADD_ITEM: {
          actions: 'addItem'
        },
        UPDATE_QUANTITY: [
          {
            guard: 'isValidQuantity',
            actions: 'updateQuantity'
          },
          {
            actions: 'setValidationError'
          }
        ],
        REMOVE_ITEM: [
          {
            actions: 'removeItem',
            target: 'empty',
            guard: 'hasNoItems'
          },
          {
            actions: 'removeItem'
          }
        ],
        CLEAR_CART: {
          target: 'empty',
          actions: 'clearCart'
        }
      }
    }
  }
});
