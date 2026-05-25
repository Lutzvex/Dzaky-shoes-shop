"use server";

import { db } from "@/lib/db";
import { wishlists, products, productImages } from "@/lib/db/schema/index";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Must be logged in to favorite items" };

  const existing = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
    revalidatePath("/products/[id]", "page");
    revalidatePath("/favorites");
    return { isFavorite: false };
  } else {
    await db.insert(wishlists).values({
      userId: user.id,
      productId: productId,
    });
    revalidatePath("/products/[id]", "page");
    revalidatePath("/favorites");
    return { isFavorite: true };
  }
}

export async function checkIsFavorite(productId: string) {
  const user = await getCurrentUser();
  if (!user) return false;

  const existing = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
    .limit(1);

  return existing.length > 0;
}

export async function getWishlistItems() {
  const user = await getCurrentUser();
  if (!user) return [];

  const items = await db
    .select({
      id: wishlists.id,
      productId: products.id,
      name: products.name,
      price: sql<number | null>`(
        select price::numeric from product_variants
        where product_variants.product_id = products.id
        order by is_default desc
        limit 1
      )`,
      imageUrl: productImages.url
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .where(eq(wishlists.userId, user.id));

  return items;
}
