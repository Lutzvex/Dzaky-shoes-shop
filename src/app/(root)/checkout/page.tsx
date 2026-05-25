"use client";

import { useState, useEffect } from "react";
import { getCart, type CartData } from "@/lib/actions/cart";
import { processCheckout } from "@/lib/actions/checkout";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    line1: "123 Sneaker St",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
  });
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");

  useEffect(() => {
    getCart().then((data) => {
      if (data.items.length === 0) {
        router.push("/cart");
      } else {
        setCart(data);
        setLoading(false);
      }
    });
  }, [router]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    
    const res = await processCheckout({
      address: form,
      paymentMethod,
    });

    if (res.error) {
      alert(res.error);
      setProcessing(false);
    } else {
      router.push(`/checkout/success?orderId=${res.orderId}`);
    }
  }

  if (loading || !cart) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading checkout...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-heading-2 text-dark-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        {/* Left Form */}
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
          {/* Shipping Address */}
          <section className="rounded-xl border border-light-300 p-6">
            <h2 className="text-heading-4 text-dark-900 mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-caption text-dark-700 mb-1">Street Address</label>
                <input 
                  required value={form.line1} onChange={e => setForm({...form, line1: e.target.value})}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 focus:ring-2 focus:ring-dark-500" 
                />
              </div>
              <div>
                <label className="block text-caption text-dark-700 mb-1">City</label>
                <input 
                  required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 focus:ring-2 focus:ring-dark-500" 
                />
              </div>
              <div>
                <label className="block text-caption text-dark-700 mb-1">State / Province</label>
                <input 
                  required value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 focus:ring-2 focus:ring-dark-500" 
                />
              </div>
              <div>
                <label className="block text-caption text-dark-700 mb-1">ZIP / Postal Code</label>
                <input 
                  required value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 focus:ring-2 focus:ring-dark-500" 
                />
              </div>
              <div>
                <label className="block text-caption text-dark-700 mb-1">Country</label>
                <input 
                  required value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 focus:ring-2 focus:ring-dark-500" 
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-xl border border-light-300 p-6">
            <h2 className="text-heading-4 text-dark-900 mb-6">Payment Method</h2>
            <div className="space-y-4">
              {/* Credit Card */}
              <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${paymentMethod === 'stripe' ? 'border-dark-900 bg-light-200' : 'border-light-300'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-dark-900">Credit Card (Visa / Mastercard)</span>
                  </div>
                  {paymentMethod === 'stripe' && (
                    <div className="mt-4 space-y-3">
                      <input type="text" placeholder="Card Number (0000 0000 0000 0000)" className="w-full rounded-lg border border-light-300 px-4 py-2" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="MM/YY" className="w-1/2 rounded-lg border border-light-300 px-4 py-2" />
                        <input type="text" placeholder="CVC" className="w-1/2 rounded-lg border border-light-300 px-4 py-2" />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* PayPal */}
              <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${paymentMethod === 'paypal' ? 'border-dark-900 bg-light-200' : 'border-light-300'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#003087]">PayPal</span>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <p className="mt-2 text-sm text-dark-700">You will be securely redirected to PayPal to complete your purchase.</p>
                  )}
                </div>
              </label>
            </div>
          </section>
        </form>

        {/* Right Order Summary */}
        <div className="h-fit rounded-xl border border-light-300 p-6 sticky top-24">
          <h2 className="text-heading-4 text-dark-900 mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 rounded-lg bg-light-200 overflow-hidden">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-bold text-dark-900 line-clamp-1">{item.productName}</p>
                  <p className="text-dark-700">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-light-300 pt-4 mb-6">
            <div className="flex justify-between text-body text-dark-700">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body text-dark-700">
              <span>Shipping</span>
              <span className="text-[--color-green]">Free</span>
            </div>
            <div className="flex justify-between text-lead text-dark-900 pt-2 border-t border-light-300">
              <span>Total</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            type="submit"
            form="checkout-form"
            disabled={processing}
            className={`w-full rounded-full bg-dark-900 py-4 text-body-medium text-light-100 transition ${paymentMethod === 'paypal' ? 'bg-[#ffc439] text-[#003087] hover:bg-[#f4bb36]' : 'hover:opacity-90'} ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {processing ? "Processing..." : paymentMethod === 'paypal' ? "Pay with PayPal" : `Pay $${cart.subtotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </main>
  );
}
