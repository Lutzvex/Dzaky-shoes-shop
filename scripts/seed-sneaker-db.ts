import { db } from "@/lib/db";
import { brands, categories, colors, genders, productImages, products, productVariants, sizes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || "3c5da2cb9bmshd3b19227db1dcf1p1e9bccjsn46a099f7b0ab";
const TARGET_PER_GENDER = 1000;
const GENDERS = ['men', 'women', 'youth'];
const STANDARD_SIZES = [5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getColorHex(colorName: string) {
  const c = colorName.toLowerCase();
  if (c.includes("black")) return "#000000";
  if (c.includes("white")) return "#FFFFFF";
  if (c.includes("red") || c.includes("crimson")) return "#FF0000";
  if (c.includes("blue")) return "#0000FF";
  if (c.includes("green") || c.includes("khaki")) return "#00FF00";
  if (c.includes("yellow")) return "#FFFF00";
  if (c.includes("grey") || c.includes("gray") || c.includes("silver")) return "#808080";
  if (c.includes("pink")) return "#FFC0CB";
  return "#CCCCCC";
}

async function getOrCreateCategory(name: string) {
  const slug = slugify(name);
  const existing = await db.select().from(categories).where(eq(categories.slug, slug));
  if (existing.length > 0) return existing[0].id;
  const res = await db.insert(categories).values({ name, slug }).returning();
  return res[0].id;
}

// Caches to avoid hammering DB
const brandCache = new Map<string, string>();
const genderCache = new Map<string, string>();
const colorCache = new Map<string, string>();
const sizeCache = new Map<string, string>();

async function getOrCreateBrand(name: string) {
  const slug = slugify(name);
  if (brandCache.has(slug)) return brandCache.get(slug)!;
  const existing = await db.select().from(brands).where(eq(brands.slug, slug));
  if (existing.length > 0) {
    brandCache.set(slug, existing[0].id);
    return existing[0].id;
  }
  const res = await db.insert(brands).values({ name, slug }).returning();
  brandCache.set(slug, res[0].id);
  return res[0].id;
}

async function getOrCreateGender(label: string) {
  const slug = slugify(label);
  if (genderCache.has(slug)) return genderCache.get(slug)!;
  const existing = await db.select().from(genders).where(eq(genders.slug, slug));
  if (existing.length > 0) {
    genderCache.set(slug, existing[0].id);
    return existing[0].id;
  }
  const res = await db.insert(genders).values({ label, slug }).returning();
  genderCache.set(slug, res[0].id);
  return res[0].id;
}

async function getOrCreateColor(name: string) {
  const slug = slugify(name);
  if (colorCache.has(slug)) return colorCache.get(slug)!;
  const existing = await db.select().from(colors).where(eq(colors.slug, slug));
  if (existing.length > 0) {
    colorCache.set(slug, existing[0].id);
    return existing[0].id;
  }
  const res = await db.insert(colors).values({ name, slug, hexCode: getColorHex(name) }).returning();
  colorCache.set(slug, res[0].id);
  return res[0].id;
}

async function main() {
  console.log("Starting massive seed operation...");

  console.log("Pre-populating standard sizes...");
  for (const size of STANDARD_SIZES) {
    const sizeLabel = size.toString();
    const sizeSlug = slugify(sizeLabel);
    const existingSize = await db.select().from(sizes).where(eq(sizes.slug, sizeSlug));
    if (existingSize.length > 0) {
      sizeCache.set(sizeLabel, existingSize[0].id);
    } else {
      const sortOrderVal = Math.round(size * 10);
      const res = await db.insert(sizes).values({ name: sizeLabel, slug: sizeSlug, sortOrder: sortOrderVal }).returning();
      sizeCache.set(sizeLabel, res[0].id);
    }
  }

  const categoryId = await getOrCreateCategory("Sneakers");

  for (const g of GENDERS) {
    console.log(`\n=== FETCHING ${g.toUpperCase()} SNEAKERS ===`);
    let validCount = 0;
    let page = 1;
    let sneakersBatch: any[] = [];
    
    while (validCount < TARGET_PER_GENDER) {
      console.log(`Fetching page ${page} for ${g}... (Current valid count: ${validCount}/${TARGET_PER_GENDER})`);
      
      try {
        const res = await fetch(`https://the-sneaker-database.p.rapidapi.com/sneakers?limit=100&page=${page}&gender=${g}`, {
          headers: {
            'x-rapidapi-host': 'the-sneaker-database.p.rapidapi.com',
            'x-rapidapi-key': RAPID_API_KEY
          }
        });

        if (!res.ok) {
          console.error(`Failed: HTTP ${res.status}`);
          await delay(2000);
          continue;
        }

        const data = await res.json();
        const results = data.results || [];
        
        if (results.length === 0) {
          console.log("No more results from API. Breaking loop.");
          break;
        }

        for (const item of results) {
          if (item.image?.original) {
            sneakersBatch.push(item);
            validCount++;
            if (validCount >= TARGET_PER_GENDER) break;
          }
        }
        
      } catch (err: any) {
        console.error(`Fetch error: ${err.message}`);
      }

      page++;
      await delay(1000); // Wait 1 second between requests to respect rate limits
    }

    console.log(`\nFound ${sneakersBatch.length} valid ${g} sneakers. Inserting into database in chunks...`);
    
    const CHUNK_SIZE = 100;
    for (let i = 0; i < sneakersBatch.length; i += CHUNK_SIZE) {
      const chunk = sneakersBatch.slice(i, i + CHUNK_SIZE);
      console.log(`Inserting chunk ${Math.floor(i/CHUNK_SIZE) + 1} of ${Math.ceil(sneakersBatch.length/CHUNK_SIZE)}...`);
      
      const productsToInsert: any[] = [];
      const variantsToInsert: any[] = [];
      const imagesToInsert: any[] = [];

      for (const item of chunk) {
        const brandId = await getOrCreateBrand(item.brand || "Unknown");
        const genderLabel = item.gender ? item.gender.charAt(0).toUpperCase() + item.gender.slice(1) : "Unisex";
        const genderId = await getOrCreateGender(genderLabel);
        const colorDesc = item.colorway || "Default";
        const colorId = await getOrCreateColor(colorDesc);

        const productId = uuidv4();
        
        productsToInsert.push({
          id: productId,
          name: item.name,
          description: item.story || `${item.name} by ${item.brand}`,
          brandId,
          categoryId,
          genderId,
          isPublished: true,
        });

        const price = item.retailPrice || item.estimatedMarketValue || 120;
        
        for (const size of STANDARD_SIZES) {
          const sizeId = sizeCache.get(size.toString())!;
          const sku = item.sku ? `${item.sku}-${size}` : uuidv4();
          variantsToInsert.push({
            id: uuidv4(),
            productId,
            sku,
            price: price.toString(),
            colorId,
            sizeId,
            inStock: Math.floor(Math.random() * 50) + 10,
          });
        }

        imagesToInsert.push({
          id: uuidv4(),
          productId,
          url: item.image.original,
          sortOrder: 0,
          isPrimary: true,
        });
      }

      if (productsToInsert.length > 0) {
        await db.insert(products).values(productsToInsert).onConflictDoNothing();
      }
      
      // Insert variants in smaller chunks to avoid PG parameter limits
      if (variantsToInsert.length > 0) {
        const V_CHUNK = 1000;
        for (let j = 0; j < variantsToInsert.length; j += V_CHUNK) {
          await db.insert(productVariants).values(variantsToInsert.slice(j, j + V_CHUNK)).onConflictDoNothing();
        }
      }
      
      if (imagesToInsert.length > 0) {
        await db.insert(productImages).values(imagesToInsert).onConflictDoNothing();
      }
    }
  }

  console.log("Massive seeding complete!");
}

main().catch(console.error);
