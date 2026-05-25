import { db } from "@/lib/db";
import { brands, categories, colors, genders, productImages, products, productVariants, sizes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || "3c5da2cb9bmshd3b19227db1dcf1p1e9bccjsn46a099f7b0ab";

const NIKE_URLS = [
  "https://www.nike.com/t/air-force-1-07-mens-shoes-jBrhbr/CW2288-111",
  "https://www.nike.com/t/dunk-low-retro-mens-shoes-111Bdd/DD1391-100",
  "https://www.nike.com/t/air-max-270-mens-shoes-KkLcGR/AH8050-002",
  "https://www.nike.com/t/air-jordan-1-mid-shoes-sqf7MV/DQ8426-014",
  "https://www.nike.com/t/pegasus-40-mens-road-running-shoes-MCnWvd/DV3853-001",
  "https://www.nike.com/t/tatum-2-mens-basketball-shoes-5x2zB7/FJ6457-100",
  "https://www.nike.com/t/air-max-97-mens-shoes-11F259/921826-001",
  "https://www.nike.com/t/blazer-mid-77-vintage-mens-shoes-nw30B2/BQ6806-100",
  "https://www.nike.com/t/killshot-2-leather-mens-shoes-zrq1wk/432997-107",
  "https://www.nike.com/t/air-huarache-runner-mens-shoes-1qfB0b/DZ3306-002"
];

async function fetchNikeProduct(url: string) {
  const res = await fetch(`https://nike-api.p.rapidapi.com/get-mens-shoe-details?product_url=${encodeURIComponent(url)}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'nike-api.p.rapidapi.com',
      'x-rapidapi-key': RAPID_API_KEY
    }
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-\.]+/g, '')       // Remove all non-word chars except . and -
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function getColorHex(colorName: string) {
  const c = colorName.toLowerCase();
  if (c.includes("black")) return "#000000";
  if (c.includes("white")) return "#FFFFFF";
  if (c.includes("red")) return "#FF0000";
  if (c.includes("blue")) return "#0000FF";
  if (c.includes("green")) return "#00FF00";
  if (c.includes("yellow")) return "#FFFF00";
  if (c.includes("grey") || c.includes("gray")) return "#808080";
  return "#CCCCCC"; // default
}

async function main() {
  console.log("Starting seeding process...");

  console.log("Clearing old products...");
  await db.delete(products);
  await db.delete(colors);
  await db.delete(sizes);

  // 1. Setup Brand
  let brandId = "";
  const existingBrands = await db.select().from(brands).where(eq(brands.name, "Nike"));
  if (existingBrands.length > 0) {
    brandId = existingBrands[0].id;
  } else {
    const res = await db.insert(brands).values({ name: "Nike", slug: "nike" }).returning();
    brandId = res[0].id;
  }

  // 2. Setup Category
  let categoryId = "";
  const existingCats = await db.select().from(categories).where(eq(categories.name, "Sneakers"));
  if (existingCats.length > 0) {
    categoryId = existingCats[0].id;
  } else {
    const res = await db.insert(categories).values({ name: "Sneakers", slug: "sneakers" }).returning();
    categoryId = res[0].id;
  }

  // 3. Setup Gender
  let genderId = "";
  const existingGenders = await db.select().from(genders).where(eq(genders.label, "Men"));
  if (existingGenders.length > 0) {
    genderId = existingGenders[0].id;
  } else {
    const res = await db.insert(genders).values({ label: "Men", slug: "men" }).returning();
    genderId = res[0].id;
  }

  for (const url of NIKE_URLS) {
    try {
      console.log(`Fetching ${url}...`);
      const apiData = await fetchNikeProduct(url);
      
      const title = apiData.full_title;
      const description = apiData.description || "No description available.";
      const priceStr = apiData.current_price?.toString() || "100";
      const colorDesc = apiData.color_description || "Default Color";
      
      console.log(`Inserting product: ${title}`);
      const productRes = await db.insert(products).values({
        name: title,
        description: description,
        brandId,
        categoryId,
        genderId,
        isPublished: true,
      }).returning();
      const productId = productRes[0].id;

      // Ensure color exists
      let colorId = "";
      const colorSlug = slugify(colorDesc);
      const existingColor = await db.select().from(colors).where(eq(colors.slug, colorSlug));
      if (existingColor.length > 0) {
        colorId = existingColor[0].id;
      } else {
        const hex = getColorHex(colorDesc);
        const res = await db.insert(colors).values({ name: colorDesc, slug: colorSlug, hexCode: hex }).returning();
        colorId = res[0].id;
      }

      // Sizes and Variants
      const sizesData = apiData.available_sizes || [];
      for (const sizeObj of sizesData) {
        if (!sizeObj.available) continue;
        
        const sizeLabel = sizeObj.label;
        const sizeSlug = slugify(sizeLabel);
        let sizeId = "";
        
        const existingSize = await db.select().from(sizes).where(eq(sizes.slug, sizeSlug));
        if (existingSize.length > 0) {
          sizeId = existingSize[0].id;
        } else {
          try {
            const sortOrderVal = Math.round((parseFloat(sizeLabel) || 0) * 10);
            const res = await db.insert(sizes).values({ name: sizeLabel, slug: sizeSlug, sortOrder: sortOrderVal }).returning();
            sizeId = res[0].id;
          } catch (err: any) {
            const newlyExisting = await db.select().from(sizes).where(eq(sizes.slug, sizeSlug));
            if (newlyExisting.length > 0) {
              sizeId = newlyExisting[0].id;
            } else {
              throw err;
            }
          }
        }

        const sku = sizeObj.merchSkuId || uuidv4();
        
        // Insert Variant
        await db.insert(productVariants).values({
          productId,
          sku,
          price: priceStr,
          colorId,
          sizeId,
          inStock: 10,
        }).onConflictDoNothing();
      }

      // Images
      const imagesData = apiData.images || [];
      let sortOrder = 0;
      for (const img of imagesData) {
        // Skip portrait/squarish duplicates if we want, or insert all. We will insert sq/portrait as provided.
        // Usually, `url` is what we need. Let's just insert unique URLs.
        // Wait, images from Nike can have duplicates with same URL.
        await db.insert(productImages).values({
          productId,
          url: img.url,
          sortOrder,
          isPrimary: sortOrder === 0,
        });
        sortOrder++;
      }

      console.log(`Successfully seeded ${title}`);

    } catch (e: any) {
      console.log(`Failed to process ${url}: ${e.message}`);
    } finally {
      // Delay to avoid 429 Too Many Requests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log("Seeding complete!");
}

main().catch(console.error);
