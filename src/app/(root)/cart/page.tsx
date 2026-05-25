"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { getCart, updateCartItemQuantity, removeFromCart, type CartData } from "@/lib/actions/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    const data = await getCart();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => { loadCart(); }, []);

  async function handleUpdateQuantity(itemId: string, newQty: number) {
    await updateCartItemQuantity(itemId, newQty);
    await loadCart();
  }

  async function handleRemove(itemId: string) {
    await removeFromCart(itemId);
    await loadCart();
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-heading-2 text-dark-900 mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-light-200" />
          ))}
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-heading-2 text-dark-900 mb-8">Shopping Cart</h1>
        <div className="rounded-xl border border-light-300 p-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-dark-700/30 mb-4" />
          <h2 className="text-heading-4 text-dark-900 mb-2">Your cart is empty</h2>
          <p className="text-body text-dark-700 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-8 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-heading-2 text-dark-900 mb-8">Shopping Cart ({cart.totalItems})</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-light-300 p-4">
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-light-200">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-dark-700/30">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.productId}`} className="text-body-medium text-dark-900 hover:underline">
                    {item.productName}
                  </Link>
                  <div className="mt-1 flex gap-3 text-caption text-dark-700">
                    {item.colorName && <span>Color: {item.colorName}</span>}
                    {item.sizeName && <span>Size: {item.sizeName}</span>}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-300 text-dark-900 transition hover:border-dark-500"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-body-medium text-dark-900">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-300 text-dark-900 transition hover:border-dark-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-body-medium text-dark-900">${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-dark-700 transition hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-light-300 p-6">
          <h2 className="text-heading-4 text-dark-900 mb-4">Order Summary</h2>
          <div className="space-y-3 border-b border-light-300 pb-4 mb-4">
            <div className="flex justify-between text-body text-dark-700">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body text-dark-700">
              <span>Shipping</span>
              <span className="text-[--color-green]">Free</span>
            </div>
          </div>
          <div className="flex justify-between text-lead text-dark-900 mb-6">
            <span>Total</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="w-full flex justify-center rounded-full bg-dark-900 py-4 text-body-medium text-light-100 transition hover:opacity-90">
            Checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-body text-dark-700 hover:text-dark-900 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
