"use server";

import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages, colors, sizes } from "@/lib/db/schema";
import { and, eq, sql, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/actions";
import { cookies } from "next/headers";

export type CartItemDisplay = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  colorName: string | null;
  sizeName: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

export type CartData = {
  items: CartItemDisplay[];
  totalItems: number;
  subtotal: number;
};

async function getOrCreateCart(): Promise<string> {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  
  if (user) {
    // Find existing cart for user
    const existing = await db.select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);
    if (existing.length) return existing[0].id;
    
    // Create new cart for user
    const result = await db.insert(carts).values({ userId: user.id }).returning({ id: carts.id });
    return result[0].id;
  }
  
  // Guest flow
  const guestToken = cookieStore.get("guest_session")?.value;
  if (guestToken) {
    // Look up guest by session token, then find cart
    const { guests } = await import("@/lib/db/schema");
    const guestRows = await db.select({ id: guests.id }).from(guests).where(eq(guests.sessionToken, guestToken)).limit(1);
    if (guestRows.length) {
      const guestId = guestRows[0].id;
      const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.guestId, guestId)).limit(1);
      if (existing.length) return existing[0].id;
      const result = await db.insert(carts).values({ guestId }).returning({ id: carts.id });
      return result[0].id;
    }
  }
  
  // Create guest session and cart
  const { createGuestSession } = await import("@/lib/auth/actions");
  await createGuestSession();
  const newToken = (await cookies()).get("guest_session")?.value;
  if (!newToken) throw new Error("Failed to create guest session");
  
  const { guests } = await import("@/lib/db/schema");
  const guestRows = await db.select({ id: guests.id }).from(guests).where(eq(guests.sessionToken, newToken)).limit(1);
  if (!guestRows.length) throw new Error("Guest not found");
  
  const result = await db.insert(carts).values({ guestId: guestRows[0].id }).returning({ id: carts.id });
  return result[0].id;
}

async function findCartId(): Promise<string | null> {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  
  if (user) {
    const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, user.id)).limit(1);
    return existing[0]?.id ?? null;
  }
  
  const guestToken = cookieStore.get("guest_session")?.value;
  if (guestToken) {
    const { guests } = await import("@/lib/db/schema");
    const guestRows = await db.select({ id: guests.id }).from(guests).where(eq(guests.sessionToken, guestToken)).limit(1);
    if (guestRows.length) {
      const existing = await db.select({ id: carts.id }).from(carts).where(eq(carts.guestId, guestRows[0].id)).limit(1);
      return existing[0]?.id ?? null;
    }
  }
  return null;
}

export async function getCart(): Promise<CartData> {
  const cartId = await findCartId();
  if (!cartId) return { items: [], totalItems: 0, subtotal: 0 };
  
  const rows = await db
    .select({
      id: cartItems.id,
      variantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      price: sql<number>`${productVariants.price}::numeric`,
      colorName: colors.name,
      sizeName: sizes.name,
      imageUrl: sql<string | null>`(
        select url from product_images 
        where product_images.product_id = ${products.id} 
        and product_images.variant_id is null 
        order by is_primary desc, sort_order asc 
        limit 1
      )`,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(eq(cartItems.cartId, cartId));

  const items: CartItemDisplay[] = rows.map((r) => ({
    id: r.id,
    variantId: r.variantId,
    productId: r.productId,
    productName: r.productName,
    colorName: r.colorName,
    sizeName: r.sizeName,
    price: Number(r.price),
    quantity: r.quantity,
    imageUrl: r.imageUrl,
  }));

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, totalItems, subtotal };
}

export async function getCartCount(): Promise<number> {
  const cartId = await findCartId();
  if (!cartId) return 0;
  
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  
  return Number(rows[0]?.total ?? 0);
}

export async function addToCart(variantId: string, quantity: number = 1) {
  const cartId = await getOrCreateCart();
  
  // Check if item already exists
  const existing = await db.select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productVariantId, variantId)))
    .limit(1);
  
  if (existing.length) {
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productVariantId: variantId,
      quantity,
    });
  }
  
  return { ok: true };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity < 1) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }
  return { ok: true };
}

export async function removeFromCart(itemId: string) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return { ok: true };
}
