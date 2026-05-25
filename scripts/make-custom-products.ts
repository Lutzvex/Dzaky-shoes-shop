import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Making some products 'Custom'...");
  
  // Select 12 random products that don't have Custom in their name
  const randomProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(sql`name NOT ILIKE '%custom%'`)
    .limit(12);

  for (const product of randomProducts) {
    const newName = `${product.name} (Custom Design)`;
    await db
      .update(products)
      .set({ name: newName })
      .where(sql`id = ${product.id}`);
    console.log(`Updated: ${newName}`);
  }
  
  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);
