import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { cartMachine } from './cartMachine';

describe('cartMachine', () => {
  const mockProduct = { id: '1', name: 'Test Product', price: 100 };
  const mockProduct2 = { id: '2', name: 'Test Product 2', price: 50 };

  it('starts in empty state with an empty cart', () => {
    const actor = createActor(cartMachine).start();
    expect(actor.getSnapshot().value).toBe('empty');
    expect(actor.getSnapshot().context.items).toEqual({});
  });

  it('transitions to hasItems on ADD_ITEM', () => {
    const actor = createActor(cartMachine).start();
    
    actor.send({ type: 'ADD_ITEM', product: mockProduct });
    expect(actor.getSnapshot().value).toBe('hasItems');
    expect(actor.getSnapshot().context.items).toEqual({
      '1': { product: mockProduct, quantity: 1 }
    });

    // Adding same item increments quantity and stays in hasItems
    actor.send({ type: 'ADD_ITEM', product: mockProduct, quantity: 2 });
    expect(actor.getSnapshot().value).toBe('hasItems');
    expect(actor.getSnapshot().context.items).toEqual({
      '1': { product: mockProduct, quantity: 3 }
    });
  });

  it('handles REMOVE_ITEM event and transitions to empty if last item', () => {
    const actor = createActor(cartMachine).start();
    
    actor.send({ type: 'ADD_ITEM', product: mockProduct });
    actor.send({ type: 'ADD_ITEM', product: mockProduct2 });
    
    expect(actor.getSnapshot().value).toBe('hasItems');

    actor.send({ type: 'REMOVE_ITEM', productId: '1' });
    
    expect(actor.getSnapshot().value).toBe('hasItems'); // Still has item 2
    expect(actor.getSnapshot().context.items['2']).toBeDefined();
    
    actor.send({ type: 'REMOVE_ITEM', productId: '2' });
    expect(actor.getSnapshot().value).toBe('empty'); // Empty now
    expect(actor.getSnapshot().context.items).toEqual({});
  });

  it('handles UPDATE_QUANTITY event', () => {
    const actor = createActor(cartMachine).start();
    
    actor.send({ type: 'ADD_ITEM', product: mockProduct });
    
    actor.send({ type: 'UPDATE_QUANTITY', productId: '1', quantity: 5 });
    expect(actor.getSnapshot().context.items['1'].quantity).toBe(5);
    expect(actor.getSnapshot().context.lastError).toBeNull();
  });

  it('prevents UPDATE_QUANTITY to less than 1 and sets lastError', () => {
    const actor = createActor(cartMachine).start();
    
    actor.send({ type: 'ADD_ITEM', product: mockProduct });
    
    actor.send({ type: 'UPDATE_QUANTITY', productId: '1', quantity: 0 });
    // Guard should prevent the update and set validation error
    expect(actor.getSnapshot().context.items['1'].quantity).toBe(1);
    expect(actor.getSnapshot().context.lastError).toBe('Invalid quantity');
  });

  it('handles CLEAR_CART event and transitions to empty', () => {
    const actor = createActor(cartMachine).start();
    
    actor.send({ type: 'ADD_ITEM', product: mockProduct });
    actor.send({ type: 'ADD_ITEM', product: mockProduct2 });
    
    actor.send({ type: 'CLEAR_CART' });
    expect(actor.getSnapshot().value).toBe('empty');
    expect(actor.getSnapshot().context.items).toEqual({});
  });
});
