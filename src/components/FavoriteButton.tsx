"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useRouter } from "next/navigation";

export default function FavoriteButton({ 
  productId, 
  initialIsFavorite 
}: { 
  productId: string; 
  initialIsFavorite: boolean; 
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await toggleWishlist(productId);
      if (res.error) {
        // You might want to redirect to sign-in or show a toast
        router.push("/sign-in");
        return;
      }
      setIsFavorite(res.isFavorite!);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-body-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
        isFavorite 
          ? "border-red-500 text-red-500 hover:bg-red-50" 
          : "border-light-300 text-dark-900 hover:border-dark-500"
      } ${loading ? "opacity-50" : ""}`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorited" : "Favorite"}
    </button>
  );
}
