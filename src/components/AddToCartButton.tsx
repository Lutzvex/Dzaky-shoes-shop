"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ variantId }: { variantId: string | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const router = useRouter();

  async function handleClick() {
    if (!variantId) {
      alert("Please select a size and color first.");
      return;
    }
    setStatus("loading");
    try {
      await addToCart(variantId);
      setStatus("added");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
      alert("Failed to add to cart. Please try again.");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className="flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingBag className="h-5 w-5" />
      {status === "loading" ? "Adding..." : status === "added" ? "Added to Cart ✓" : "Add to Bag"}
    </button>
  );
}
