import { db } from '../src/lib/db';
import { collections, productCollections, products } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('Adding new collections...');

  const newCollections = [
    { id: uuidv4(), name: "Winter '25", slug: 'winter-25' },
    { id: uuidv4(), name: 'Best Sellers', slug: 'best-sellers' },
    { id: uuidv4(), name: 'Clearance', slug: 'clearance' },
  ];

  for (const col of newCollections) {
    const exists = await db.select().from(collections).where(eq(collections.slug, col.slug)).limit(1);
    if (!exists.length) {
      await db.insert(collections).values(col);
      console.log(`Added collection: ${col.name}`);
    } else {
      console.log(`Collection ${col.name} already exists.`);
      col.id = exists[0].id;
    }
  }

  const allProducts = await db.select().from(products);
  
  if (allProducts.length === 0) {
    console.log('No products found to associate with collections.');
    return;
  }

  console.log('Associating products with new collections...');
  for (const product of allProducts) {
    // Randomly assign products to the new collections
    if (Math.random() < 0.3) {
      await db.insert(productCollections).values({
        productId: product.id,
        collectionId: newCollections[0].id,
      }).catch(() => {}); // ignore duplicates
    }
    if (Math.random() < 0.2) {
      await db.insert(productCollections).values({
        productId: product.id,
        collectionId: newCollections[1].id,
      }).catch(() => {});
    }
    if (Math.random() < 0.15) {
      await db.insert(productCollections).values({
        productId: product.id,
        collectionId: newCollections[2].id,
      }).catch(() => {});
    }
  }

  console.log('Done!');
}

main().catch(console.error);
