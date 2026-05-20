"use server";

import { db } from "@/lib/db";
import { collections, productCollections, productImages, products } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export type CollectionListItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
};

export async function getAllCollections(): Promise<CollectionListItem[]> {
  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      imageUrl: sql<string | null>`max(case when pi.rn = 1 then pi.url else null end)`,
      productCount: sql<number>`count(distinct ${productCollections.productId})`,
    })
    .from(collections)
    .leftJoin(productCollections, eq(productCollections.collectionId, collections.id))
    .leftJoin(products, eq(products.id, productCollections.productId))
    .leftJoin(
      db
        .select({
          productId: productImages.productId,
          url: productImages.url,
          rn: sql<number>`row_number() over (partition by ${productImages.productId} order by ${productImages.isPrimary} desc, ${productImages.sortOrder} asc)`.as("rn"),
        })
        .from(productImages)
        .as("pi"),
      eq(sql`pi."product_id"`, products.id)
    )
    .groupBy(collections.id, collections.name, collections.slug, collections.createdAt)
    .orderBy(asc(collections.createdAt));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    imageUrl: r.imageUrl,
    productCount: Number(r.productCount),
  }));
}

export async function getCollectionBySlug(slug: string) {
  const result = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
    
  return result[0] ?? null;
}
