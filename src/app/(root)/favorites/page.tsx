import { getWishlistItems } from "@/lib/actions/wishlist";
import { getCurrentUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { Card } from "@/components";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const items = await getWishlistItems();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-heading-2 text-dark-900 mb-8">Your Favorites</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-light-300 p-12 text-center">
          <Heart className="mx-auto h-16 w-16 text-dark-700/30 mb-4" />
          <h2 className="text-heading-4 text-dark-900 mb-2">No favorites yet</h2>
          <p className="text-body text-dark-700 mb-6">Save items you love to your favorites to easily find them later.</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-8 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              title={item.name}
              imageSrc={item.imageUrl || "/google.svg"}
              price={item.price ? Number(item.price) : undefined}
              href={`/products/${item.productId}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
