"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="rounded-xl border border-light-300 bg-light-100 p-12 text-center max-w-2xl mx-auto mt-16">
      <CheckCircle2 className="mx-auto h-20 w-20 text-[--color-green] mb-6" />
      <h1 className="text-heading-2 text-dark-900 mb-4">Payment Successful!</h1>
      <p className="text-body text-dark-700 mb-8">
        Thank you for your purchase. We have received your order and are getting it ready to be shipped.
      </p>
      
      {orderId && (
        <div className="mb-8 p-4 bg-light-200 rounded-lg">
          <p className="text-caption text-dark-700 uppercase tracking-widest mb-1">Order Number</p>
          <p className="font-mono text-body-medium text-dark-900">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="rounded-full bg-dark-900 px-8 py-3 text-body-medium text-light-100 transition hover:opacity-90"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="rounded-full border border-light-300 px-8 py-3 text-body-medium text-dark-900 transition hover:border-dark-500"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <Suspense fallback={<div className="mt-20 text-center">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
