import { setup, assign } from 'xstate';

export const initialShippingData = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States'
};

export const initialPaymentData = {
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvc: '',
  paymentMethod: 'credit-card'
};

export function validateShipping(shippingData) {
  const errors = {};
  if (!shippingData.fullName || shippingData.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (at least 2 characters)';
  }
  if (!shippingData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  if (!shippingData.address || shippingData.address.trim().length < 5) {
    errors.address = 'Street address is required';
  }
  if (!shippingData.city || shippingData.city.trim().length < 2) {
    errors.city = 'City is required';
  }
  if (!shippingData.state || shippingData.state.trim().length < 2) {
    errors.state = 'State / Province is required';
  }
  if (!shippingData.zipCode || shippingData.zipCode.trim().length < 3) {
    errors.zipCode = 'ZIP / Postal code is required';
  }
  if (!shippingData.country || shippingData.country.trim().length < 2) {
    errors.country = 'Country is required';
  }
  return errors;
}

export function validatePayment(paymentData) {
  const errors = {};
  if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 2) {
    errors.cardholderName = 'Cardholder name is required';
  }
  const cleanCardNumber = (paymentData.cardNumber || '').replace(/\s+/g, '');
  if (!cleanCardNumber || !/^\d{15,16}$/.test(cleanCardNumber)) {
    errors.cardNumber = 'Card number must be 15 or 16 digits';
  }
  if (!paymentData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate.trim())) {
    errors.expiryDate = 'Expiry date must be in MM/YY format';
  } else {
    const [monthStr, yearStr] = paymentData.expiryDate.trim().split('/');
    const month = parseInt(monthStr, 10);
    const year = 2000 + parseInt(yearStr, 10);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiryDate = 'Card has expired';
    }
  }
  if (!paymentData.cvc || !/^\d{3,4}$/.test(paymentData.cvc.trim())) {
    errors.cvc = 'CVC must be 3 or 4 digits';
  }
  return errors;
}

export const checkoutMachine = setup({
  types: {
    context: {},
    events: {}
  },
  actions: {
    updateShippingField: assign({
      shippingData: ({ context, event }) => ({
        ...context.shippingData,
        [event.field]: event.value
      }),
      shippingErrors: ({ context, event }) => {
        const nextData = { ...context.shippingData, [event.field]: event.value };
        const errors = validateShipping(nextData);
        // Clear specific error if fixed
        const newErrors = { ...context.shippingErrors };
        if (!errors[event.field]) {
          delete newErrors[event.field];
        } else {
          newErrors[event.field] = errors[event.field];
        }
        return newErrors;
      }
    }),
    setShippingErrors: assign({
      shippingErrors: ({ context }) => validateShipping(context.shippingData)
    }),
    clearShippingErrors: assign({
      shippingErrors: () => ({})
    }),
    updatePaymentField: assign({
      paymentData: ({ context, event }) => ({
        ...context.paymentData,
        [event.field]: event.value
      }),
      paymentErrors: ({ context, event }) => {
        const nextData = { ...context.paymentData, [event.field]: event.value };
        const errors = validatePayment(nextData);
        const newErrors = { ...context.paymentErrors };
        if (!errors[event.field]) {
          delete newErrors[event.field];
        } else {
          newErrors[event.field] = errors[event.field];
        }
        return newErrors;
      }
    }),
    setPaymentErrors: assign({
      paymentErrors: ({ context }) => validatePayment(context.paymentData)
    }),
    clearPaymentErrors: assign({
      paymentErrors: () => ({})
    }),
    setOrder: assign({
      order: ({ event }) => event.order,
      submissionError: null
    }),
    setSubmissionError: assign({
      submissionError: ({ event }) => event.error || 'Failed to place order. Please try again.'
    }),
    resetCheckout: assign({
      shippingData: () => ({ ...initialShippingData }),
      paymentData: () => ({ ...initialPaymentData }),
      shippingErrors: () => ({}),
      paymentErrors: () => ({}),
      order: () => null,
      submissionError: () => null
    })
  },
  guards: {
    isShippingValid: ({ context }) => {
      const errors = validateShipping(context.shippingData);
      return Object.keys(errors).length === 0;
    },
    isPaymentValid: ({ context }) => {
      const errors = validatePayment(context.paymentData);
      return Object.keys(errors).length === 0;
    }
  }
}).createMachine({
  id: 'checkout',
  initial: 'shipping',
  context: {
    shippingData: { ...initialShippingData },
    paymentData: { ...initialPaymentData },
    shippingErrors: {},
    paymentErrors: {},
    order: null,
    submissionError: null
  },
  on: {
    RESET_CHECKOUT: {
      target: '.shipping',
      actions: 'resetCheckout'
    }
  },
  states: {
    shipping: {
      on: {
        UPDATE_SHIPPING_FIELD: {
          actions: 'updateShippingField'
        },
        GO_TO_PAYMENT: [
          {
            guard: 'isShippingValid',
            target: 'payment',
            actions: 'clearShippingErrors'
          },
          {
            actions: 'setShippingErrors'
          }
        ]
      }
    },
    payment: {
      on: {
        UPDATE_PAYMENT_FIELD: {
          actions: 'updatePaymentField'
        },
        GO_TO_SHIPPING: {
          target: 'shipping'
        },
        GO_TO_REVIEW: [
          {
            guard: 'isPaymentValid',
            target: 'review',
            actions: 'clearPaymentErrors'
          },
          {
            actions: 'setPaymentErrors'
          }
        ]
      }
    },
    review: {
      on: {
        GO_TO_PAYMENT: {
          target: 'payment'
        },
        GO_TO_SHIPPING: {
          target: 'shipping'
        },
        SUBMIT_ORDER: {
          target: 'submitting'
        }
      }
    },
    submitting: {
      on: {
        SET_ORDER_SUCCESS: {
          target: 'confirmation',
          actions: 'setOrder'
        },
        SET_ORDER_FAILURE: {
          target: 'review',
          actions: 'setSubmissionError'
        }
      }
    },
    confirmation: {
      on: {
        RESET_CHECKOUT: {
          target: 'shipping',
          actions: 'resetCheckout'
        }
      }
    }
  }
});
