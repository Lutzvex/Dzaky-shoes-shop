import { db } from "@/lib/db";
import { collections, productCollections, products } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding collections...");
  
  // 1. Fetch some products to assign
  const latestProducts = await db.select().from(products).orderBy(desc(products.createdAt)).limit(100);
  const cheapestProducts = await db.select().from(products).orderBy(asc(products.id)).limit(100); // just using id as randomizer or random offset
  const randomProducts1 = await db.select().from(products).limit(50).offset(200);
  const randomProducts2 = await db.select().from(products).limit(50).offset(500);

  // 2. Fetch existing collections
  const existingCols = await db.select().from(collections);
  
  if (existingCols.length === 0) {
    console.log("No collections found, nothing to map.");
    return;
  }

  // 3. Clear existing product_collections mapping
  await db.delete(productCollections);

  // 4. Map products to collections based on names
  const insertMappings: any[] = [];
  
  for (const col of existingCols) {
    let targetProducts: any[] = [];
    
    if (col.slug === "new-arrivals") targetProducts = latestProducts.slice(0, 48);
    else if (col.slug === "summer-25") targetProducts = randomProducts1;
    else if (col.slug === "winter-25") targetProducts = randomProducts2;
    else if (col.slug === "best-sellers") targetProducts = latestProducts.slice(48, 96);
    else if (col.slug === "clearance") targetProducts = cheapestProducts.slice(0, 48);
    else targetProducts = latestProducts.slice(0, 20); // fallback

    for (const p of targetProducts) {
      insertMappings.push({
        id: uuidv4(),
        productId: p.id,
        collectionId: col.id,
      });
    }
  }

  // 5. Insert mappings in chunks
  if (insertMappings.length > 0) {
    const CHUNK_SIZE = 100;
    for (let i = 0; i < insertMappings.length; i += CHUNK_SIZE) {
      const chunk = insertMappings.slice(i, i + CHUNK_SIZE);
      await db.insert(productCollections).values(chunk);
    }
    console.log(`Successfully mapped ${insertMappings.length} products to collections!`);
  } else {
    console.log("No mappings to insert.");
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
