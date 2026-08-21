import { useMachine } from '@xstate/react';
import { checkoutMachine } from '../machines/checkoutMachine';
import { useCart } from '../hooks/useCart';
import { useInventory } from '../hooks/useInventory';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, CreditCard, Truck, ShieldCheck, ArrowRight, ShoppingBag, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function CheckoutPage() {
  const [state, send] = useMachine(checkoutMachine);
  const { items, subtotal, clearCart } = useCart();
  const { connectionStatus, reconnect } = useInventory();
  const navigate = useNavigate();

  const cartItems = Object.values(items);
  const { shippingData, paymentData, shippingErrors, paymentErrors, order, submissionError } = state.context;
  const currentStep = state.value; // 'shipping' | 'payment' | 'review' | 'submitting' | 'confirmation'
  const isSocketConnected = connectionStatus === 'connected';
  const isReviewOrSubmitting = currentStep === 'review' || currentStep === 'submitting';

  // Calculate order breakdown
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const taxRate = 0.08;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotal + shippingFee + tax) * 100) / 100;

  // Handle Form Submission
  const handlePlaceOrder = async () => {
    send({ type: 'SUBMIT_ORDER' });
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
          })),
          subtotal,
          shipping: shippingFee,
          tax,
          total: grandTotal,
          shippingData
        })
      });

      if (!response.ok) {
        throw new Error('Checkout service failed. Please try again.');
      }

      const orderResult = await response.json();
      send({ type: 'SET_ORDER_SUCCESS', order: orderResult });
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      send({ type: 'SET_ORDER_FAILURE', error: err.message });
      toast.error(err.message || 'Failed to submit order');
    }
  };

  // If cart is empty and user is not on confirmation step, show Empty Cart warning
  if (cartItems.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-[--color-surface] border border-[--color-line] rounded-2xl p-10 shadow-sm max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-[--color-accent] mx-auto mb-4 opacity-75" />
          <h1 className="font-serif text-2xl font-semibold mb-2 text-[--color-ink]">Your Cart is Empty</h1>
          <p className="text-sm text-[--color-ink-muted] mb-6">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[--color-accent] text-white rounded-lg font-medium hover:bg-[--color-accent-strong] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Stepper definition
  const steps = [
    { id: 'shipping', label: '1. Shipping' },
    { id: 'payment', label: '2. Payment' },
    { id: 'review', label: '3. Review' },
    { id: 'confirmation', label: '4. Confirmation' }
  ];

  const getStepStatus = (stepId) => {
    const orderIndex = { shipping: 1, payment: 2, review: 3, submitting: 3, confirmation: 4 };
    const currentIndex = orderIndex[currentStep] || 1;
    const targetIndex = orderIndex[stepId];

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[--color-bg] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Stepper Navigation Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-[--color-line] pb-4 overflow-x-auto">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0 pr-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : status === 'active'
                        ? 'bg-[--color-accent] text-white shadow-md'
                        : 'bg-[--color-surface-hover] text-[--color-ink-muted] border border-[--color-line]'
                    }`}
                  >
                    {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : step.label.split('.')[0]}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      status === 'active'
                        ? 'text-[--color-ink] font-semibold'
                        : status === 'completed'
                        ? 'text-emerald-600'
                        : 'text-[--color-ink-muted]'
                    }`}
                  >
                    {step.label.split('. ')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 4: ORDER CONFIRMATION SCREEN */}
        {currentStep === 'confirmation' && order ? (
          <div className="max-w-3xl mx-auto bg-[--color-surface] border border-[--color-line] rounded-2xl p-6 sm:p-10 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[--color-ink] mb-2">Order Confirmed!</h1>
              <p className="text-[--color-ink-muted]">
                Thank you for your purchase. We have received your order and are preparing it for shipment.
              </p>
              <div className="inline-block mt-4 px-4 py-1.5 bg-[--color-surface-hover] border border-[--color-line] rounded-full text-xs font-mono font-medium text-[--color-ink]">
                Order ID: <span className="font-bold text-[--color-accent]">{order.orderId}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[--color-bg] rounded-xl border border-[--color-line] mb-8">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[--color-ink-muted] font-semibold mb-2">Shipping Details</h3>
                <p className="font-medium text-[--color-ink]">{order.shippingData.fullName}</p>
                <p className="text-sm text-[--color-ink-muted]">{order.shippingData.address}</p>
                <p className="text-sm text-[--color-ink-muted]">{order.shippingData.city}, {order.shippingData.state} {order.shippingData.zipCode}</p>
                <p className="text-sm text-[--color-ink-muted]">{order.shippingData.country}</p>
                <p className="text-xs text-[--color-accent] mt-2">{order.shippingData.email}</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-[--color-ink-muted] font-semibold mb-2">Delivery Summary</h3>
                <p className="text-sm text-[--color-ink-muted]">Estimated Delivery: <span className="font-semibold text-[--color-ink]">3 - 5 Business Days</span></p>
                <p className="text-sm text-[--color-ink-muted] mt-1">Payment Method: <span className="font-semibold text-[--color-ink]">Credit Card</span></p>
                <p className="text-sm text-[--color-ink-muted] mt-1">Total Paid: <span className="font-mono font-bold text-[--color-ink]">{formatPrice(order.total)}</span></p>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-8">
              <h3 className="font-serif text-lg font-semibold mb-4 text-[--color-ink]">Items Ordered</h3>
              <div className="divide-y divide-[--color-line]">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-[--color-line]" />
                      <div>
                        <p className="text-sm font-medium text-[--color-ink]">{item.name}</p>
                        <p className="text-xs text-[--color-ink-muted]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  send({ type: 'RESET_CHECKOUT' });
                  navigate('/');
                }}
                className="px-8 py-3 bg-[--color-accent] text-white rounded-xl font-medium hover:bg-[--color-accent-strong] transition-colors shadow-md text-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (

          /* MAIN CHECKOUT FORM & SUMMARY GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: FORM STEPS */}
            <div className="lg:col-span-7 bg-[--color-surface] border border-[--color-line] rounded-2xl p-6 sm:p-8 shadow-sm">
              
              {/* STEP 1: SHIPPING FORM */}
              {currentStep === 'shipping' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[--color-accent]" />
                    <h2 className="font-serif text-xl font-semibold text-[--color-ink]">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={shippingData.fullName}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'fullName', value: e.target.value })}
                        placeholder="John Doe"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.fullName}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'email', value: e.target.value })}
                        placeholder="john@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.email}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Street Address</label>
                      <input
                        id="address"
                        type="text"
                        value={shippingData.address}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'address', value: e.target.value })}
                        placeholder="123 Market Street, Suite 400"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.address}</p>}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-[--color-ink-muted] mb-1">City</label>
                      <input
                        id="city"
                        type="text"
                        value={shippingData.city}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'city', value: e.target.value })}
                        placeholder="New York"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-medium text-[--color-ink-muted] mb-1">State / Province</label>
                      <input
                        id="state"
                        type="text"
                        value={shippingData.state}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'state', value: e.target.value })}
                        placeholder="NY"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.state && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.state}</p>}
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-xs font-medium text-[--color-ink-muted] mb-1">ZIP / Postal Code</label>
                      <input
                        id="zipCode"
                        type="text"
                        value={shippingData.zipCode}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'zipCode', value: e.target.value })}
                        placeholder="10001"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          shippingErrors.zipCode ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {shippingErrors.zipCode && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{shippingErrors.zipCode}</p>}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Country</label>
                      <select
                        id="country"
                        value={shippingData.country}
                        onChange={(e) => send({ type: 'UPDATE_SHIPPING_FIELD', field: 'country', value: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[--color-line] bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent]"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => send({ type: 'GO_TO_PAYMENT' })}
                      className="px-6 py-3 bg-[--color-accent] text-white rounded-xl font-medium hover:bg-[--color-accent-strong] transition-colors flex items-center gap-2 shadow-md"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT FORM */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[--color-accent]" />
                    <h2 className="font-serif text-xl font-semibold text-[--color-ink]">Payment Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="cardholderName" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Cardholder Name</label>
                      <input
                        id="cardholderName"
                        type="text"
                        value={paymentData.cardholderName}
                        onChange={(e) => send({ type: 'UPDATE_PAYMENT_FIELD', field: 'cardholderName', value: e.target.value })}
                        placeholder="John Doe"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          paymentErrors.cardholderName ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {paymentErrors.cardholderName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{paymentErrors.cardholderName}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="cardNumber" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Card Number</label>
                      <input
                        id="cardNumber"
                        type="text"
                        maxLength="19"
                        value={paymentData.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          send({ type: 'UPDATE_PAYMENT_FIELD', field: 'cardNumber', value: val });
                        }}
                        placeholder="4532 1234 5678 9012"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          paymentErrors.cardNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {paymentErrors.cardNumber && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{paymentErrors.cardNumber}</p>}
                    </div>

                    <div>
                      <label htmlFor="expiryDate" className="block text-xs font-medium text-[--color-ink-muted] mb-1">Expiry Date (MM/YY)</label>
                      <input
                        id="expiryDate"
                        type="text"
                        maxLength="5"
                        value={paymentData.expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^\d/]/g, '');
                          if (val.length === 2 && !val.includes('/')) val += '/';
                          send({ type: 'UPDATE_PAYMENT_FIELD', field: 'expiryDate', value: val });
                        }}
                        placeholder="12/28"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          paymentErrors.expiryDate ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {paymentErrors.expiryDate && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{paymentErrors.expiryDate}</p>}
                    </div>

                    <div>
                      <label htmlFor="cvc" className="block text-xs font-medium text-[--color-ink-muted] mb-1">CVC Code</label>
                      <input
                        id="cvc"
                        type="password"
                        maxLength="4"
                        value={paymentData.cvc}
                        onChange={(e) => send({ type: 'UPDATE_PAYMENT_FIELD', field: 'cvc', value: e.target.value.replace(/\D/g, '') })}
                        placeholder="123"
                        className={`w-full px-3.5 py-2.5 rounded-lg border bg-[--color-bg] text-[--color-ink] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] transition-colors ${
                          paymentErrors.cvc ? 'border-red-500 ring-1 ring-red-500' : 'border-[--color-line]'
                        }`}
                      />
                      {paymentErrors.cvc && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{paymentErrors.cvc}</p>}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => send({ type: 'GO_TO_SHIPPING' })}
                      className="px-4 py-2 text-sm font-medium text-[--color-ink-muted] hover:text-[--color-ink] flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Shipping
                    </button>
                    <button
                      onClick={() => send({ type: 'GO_TO_REVIEW' })}
                      className="px-6 py-3 bg-[--color-accent] text-white rounded-xl font-medium hover:bg-[--color-accent-strong] transition-colors flex items-center gap-2 shadow-md"
                    >
                      Review Order
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW ORDER */}
              {(currentStep === 'review' || currentStep === 'submitting') && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[--color-line] pb-4">
                    <h2 className="font-serif text-xl font-semibold text-[--color-ink]">Review Your Order</h2>
                    <span className="text-xs text-[--color-ink-muted]">Step 3 of 3</span>
                  </div>

                  {submissionError && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  {/* WebSocket disconnect warning */}
                  {!isSocketConnected && isReviewOrSubmitting && (
                    <div
                      id="ws-disconnect-warning"
                      className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3"
                    >
                      <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Live inventory connection lost</p>
                        <p className="mt-1 text-xs opacity-80">
                          Please wait for reconnection before confirming your order. Your entered information has been preserved.
                        </p>
                        <button
                          onClick={() => reconnect()}
                          className="mt-2 text-xs font-medium underline hover:no-underline"
                        >
                          Try reconnecting now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[--color-line] bg-[--color-bg]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold uppercase text-[--color-ink-muted]">Shipping Address</h4>
                        <button
                          onClick={() => send({ type: 'GO_TO_SHIPPING' })}
                          className="text-xs font-medium text-[--color-accent] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm font-medium text-[--color-ink]">{shippingData.fullName}</p>
                      <p className="text-xs text-[--color-ink-muted]">{shippingData.address}</p>
                      <p className="text-xs text-[--color-ink-muted]">{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-[--color-line] bg-[--color-bg]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold uppercase text-[--color-ink-muted]">Payment Method</h4>
                        <button
                          onClick={() => send({ type: 'GO_TO_PAYMENT' })}
                          className="text-xs font-medium text-[--color-accent] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm font-medium text-[--color-ink]">{paymentData.cardholderName}</p>
                      <p className="text-xs text-[--color-ink-muted] font-mono">•••• •••• •••• {paymentData.cardNumber.slice(-4) || '4242'}</p>
                      <p className="text-xs text-[--color-ink-muted]">Expires: {paymentData.expiryDate}</p>
                    </div>
                  </div>

                  {/* Item List */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-[--color-ink-muted] mb-3">Order Items ({cartItems.length})</h4>
                    <div className="divide-y divide-[--color-line] max-h-60 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-md border border-[--color-line]" />
                            <div>
                              <p className="text-sm font-medium text-[--color-ink] truncate max-w-[180px] sm:max-w-[240px]">{item.product.name}</p>
                              <p className="text-xs text-[--color-ink-muted]">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[--color-line]">
                    <button
                      onClick={() => send({ type: 'GO_TO_PAYMENT' })}
                      disabled={currentStep === 'submitting'}
                      className="px-4 py-2 text-sm font-medium text-[--color-ink-muted] hover:text-[--color-ink] flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Payment
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={currentStep === 'submitting' || !isSocketConnected}
                      className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStep === 'submitting' ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          Place Order ({formatPrice(grandTotal)})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-5">
              <div className="bg-[--color-surface] border border-[--color-line] rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="font-serif text-lg font-semibold mb-4 text-[--color-ink]">Order Summary</h3>

                <div className="space-y-3 border-b border-[--color-line] pb-4 mb-4 text-sm">
                  <div className="flex justify-between text-[--color-ink-muted]">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-[--color-ink]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[--color-ink-muted]">
                    <span>Shipping</span>
                    <span className="font-mono text-[--color-ink]">
                      {shippingFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[--color-ink-muted]">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-mono text-[--color-ink]">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-[--color-ink]">Total</span>
                  <span className="font-mono text-xl font-bold text-[--color-ink]">{formatPrice(grandTotal)}</span>
                </div>

                <div className="p-3 bg-[--color-bg] rounded-lg border border-[--color-line] text-xs text-[--color-ink-muted] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Guaranteed safe & secure checkout powered by XState validation engine.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
