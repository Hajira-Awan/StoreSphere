import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { checkoutMachine, validateShipping, validatePayment } from './checkoutMachine';

describe('checkoutMachine', () => {
  const validShippingData = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  };

  const validPaymentData = {
    cardholderName: 'Jane Doe',
    cardNumber: '4532 1234 5678 9012',
    expiryDate: '12/29',
    cvc: '123',
    paymentMethod: 'credit-card'
  };

  it('validates shipping data correctly', () => {
    const emptyErrors = validateShipping({});
    expect(emptyErrors.fullName).toBeDefined();
    expect(emptyErrors.email).toBeDefined();
    expect(emptyErrors.address).toBeDefined();

    const validErrors = validateShipping(validShippingData);
    expect(Object.keys(validErrors).length).toBe(0);
  });

  it('validates payment data correctly', () => {
    const invalidErrors = validatePayment({ cardNumber: '123' });
    expect(invalidErrors.cardholderName).toBeDefined();
    expect(invalidErrors.cardNumber).toBeDefined();
    expect(invalidErrors.expiryDate).toBeDefined();

    const validErrors = validatePayment(validPaymentData);
    expect(Object.keys(validErrors).length).toBe(0);
  });

  it('starts in shipping state', () => {
    const actor = createActor(checkoutMachine).start();
    expect(actor.getSnapshot().value).toBe('shipping');
  });

  it('prevents transitioning to payment if shipping data is invalid and populates shippingErrors', () => {
    const actor = createActor(checkoutMachine).start();

    actor.send({ type: 'GO_TO_PAYMENT' });
    expect(actor.getSnapshot().value).toBe('shipping');
    expect(actor.getSnapshot().context.shippingErrors.fullName).toBeDefined();
  });

  it('transitions to payment when shipping data is populated and valid', () => {
    const actor = createActor(checkoutMachine).start();

    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });

    actor.send({ type: 'GO_TO_PAYMENT' });
    expect(actor.getSnapshot().value).toBe('payment');
    expect(actor.getSnapshot().context.shippingErrors).toEqual({});
  });

  it('prevents transitioning to review if payment data is invalid and populates paymentErrors', () => {
    const actor = createActor(checkoutMachine).start();

    // Move to payment step
    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_PAYMENT' });

    actor.send({ type: 'GO_TO_REVIEW' });
    expect(actor.getSnapshot().value).toBe('payment');
    expect(actor.getSnapshot().context.paymentErrors.cardNumber).toBeDefined();
  });

  it('transitions to review state when payment data is valid', () => {
    const actor = createActor(checkoutMachine).start();

    // Fill shipping
    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_PAYMENT' });

    // Fill payment
    Object.entries(validPaymentData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_PAYMENT_FIELD', field, value });
    });

    actor.send({ type: 'GO_TO_REVIEW' });
    expect(actor.getSnapshot().value).toBe('review');
    expect(actor.getSnapshot().context.paymentErrors).toEqual({});
  });

  it('allows navigating back to shipping from payment or review', () => {
    const actor = createActor(checkoutMachine).start();

    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_PAYMENT' });
    expect(actor.getSnapshot().value).toBe('payment');

    actor.send({ type: 'GO_TO_SHIPPING' });
    expect(actor.getSnapshot().value).toBe('shipping');
  });

  it('handles SUBMIT_ORDER and SET_ORDER_SUCCESS to reach confirmation state', () => {
    const actor = createActor(checkoutMachine).start();

    // Fill shipping and payment, move to review
    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_PAYMENT' });

    Object.entries(validPaymentData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_PAYMENT_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_REVIEW' });

    actor.send({ type: 'SUBMIT_ORDER' });
    expect(actor.getSnapshot().value).toBe('submitting');

    const mockOrder = { orderId: 'ORD-123456', total: 150 };
    actor.send({ type: 'SET_ORDER_SUCCESS', order: mockOrder });

    expect(actor.getSnapshot().value).toBe('confirmation');
    expect(actor.getSnapshot().context.order).toEqual(mockOrder);
  });

  it('handles SET_ORDER_FAILURE and sets submission error', () => {
    const actor = createActor(checkoutMachine).start();

    // Navigate to review and submit
    Object.entries(validShippingData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_SHIPPING_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_PAYMENT' });
    Object.entries(validPaymentData).forEach(([field, value]) => {
      actor.send({ type: 'UPDATE_PAYMENT_FIELD', field, value });
    });
    actor.send({ type: 'GO_TO_REVIEW' });

    actor.send({ type: 'SUBMIT_ORDER' });
    actor.send({ type: 'SET_ORDER_FAILURE', error: 'Payment gateway timeout' });

    expect(actor.getSnapshot().value).toBe('review');
    expect(actor.getSnapshot().context.submissionError).toBe('Payment gateway timeout');
  });

  it('resets machine context on RESET_CHECKOUT', () => {
    const actor = createActor(checkoutMachine).start();

    actor.send({ type: 'UPDATE_SHIPPING_FIELD', field: 'fullName', value: 'Test User' });
    actor.send({ type: 'RESET_CHECKOUT' });

    expect(actor.getSnapshot().value).toBe('shipping');
    expect(actor.getSnapshot().context.shippingData.fullName).toBe('');
  });
});
