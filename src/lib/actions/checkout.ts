"use server";

import { db } from "@/lib/db";
import { orders, orderItems, payments, addresses } from "@/lib/db/schema";
import { getCart, emptyCart } from "./cart";
import { getCurrentUser } from "@/lib/auth/actions";
import { v4 as uuidv4 } from "uuid";

type CheckoutData = {
  address: {
    line1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: "stripe" | "paypal";
};

export async function processCheckout(data: CheckoutData) {
  const cart = await getCart();
  if (cart.items.length === 0) {
    return { error: "Cart is empty" };
  }

  const user = await getCurrentUser();

  try {
    // 1. Create Address (Optional, if logged in we associate it)
    let addressId: string | null = null;
    if (user) {
      const addressResult = await db.insert(addresses).values({
        userId: user.id,
        type: "shipping",
        line1: data.address.line1,
        city: data.address.city,
        state: data.address.state,
        country: data.address.country,
        postalCode: data.address.postalCode,
      }).returning({ id: addresses.id });
      addressId = addressResult[0].id;
    }

    // 2. Create Order
    const orderResult = await db.insert(orders).values({
      userId: user?.id ?? null,
      status: "paid",
      totalAmount: cart.subtotal.toString(),
      shippingAddressId: addressId,
      billingAddressId: addressId,
    }).returning({ id: orders.id });
    
    const orderId = orderResult[0].id;

    // 3. Create Order Items
    const itemsToInsert = cart.items.map(item => ({
      orderId,
      productVariantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toString(),
    }));
    await db.insert(orderItems).values(itemsToInsert);

    // 4. Create Payment Simulation
    await db.insert(payments).values({
      orderId,
      method: data.paymentMethod,
      status: "completed",
      paidAt: new Date(),
      transactionId: `sim_${uuidv4()}`,
    });

    // 5. Clear Cart
    await emptyCart();

    return { ok: true, orderId };
  } catch (err) {
    console.error("Checkout failed:", err);
    return { error: "Failed to process checkout" };
  }
}
