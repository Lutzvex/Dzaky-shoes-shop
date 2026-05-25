import { db } from "@/lib/db";
import { brands, categories, colors, genders, productImages, products, productVariants, sizes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

// Hardcoded data from the successful API fetch before we hit the 429 Rate Limit
const apiData = {
  "available_sizes":[{"available":true,"label":"5","localized_label":"M 5 / W 6.5","merchSkuId":"81342413-c290-5e41-b477-88b0300b5d74","status":"ACTIVE"},{"available":true,"label":"5.5","localized_label":"M 5.5 / W 7","merchSkuId":"4e8edd67-d92d-55d2-bb8b-9ae96465c66c","status":"ACTIVE"},{"available":true,"label":"6","localized_label":"M 6 / W 7.5","merchSkuId":"3c95b6cf-42e7-567c-8bf2-2ee9c9398f9d","status":"ACTIVE"},{"available":true,"label":"6.5","localized_label":"M 6.5 / W 8","merchSkuId":"37d7ecad-ce5b-5c67-b7a4-b12c88b7beb2","status":"ACTIVE"},{"available":true,"label":"7","localized_label":"M 7 / W 8.5","merchSkuId":"4150c3df-97b9-5a7f-8d76-e2c5daa49025","status":"ACTIVE"},{"available":true,"label":"7.5","localized_label":"M 7.5 / W 9","merchSkuId":"898798a4-2cac-59c2-8f75-42d8566a3b4a","status":"ACTIVE"},{"available":true,"label":"8","localized_label":"M 8 / W 9.5","merchSkuId":"6a24d48b-314a-5eea-ac1f-d9e4d16d21bd","status":"ACTIVE"},{"available":true,"label":"8.5","localized_label":"M 8.5 / W 10","merchSkuId":"86c661e0-8700-5c32-a08a-7d0ee41d7bc4","status":"ACTIVE"},{"available":true,"label":"9","localized_label":"M 9 / W 10.5","merchSkuId":"022e6009-c53c-522e-8059-1dda5531a10b","status":"ACTIVE"},{"available":true,"label":"9.5","localized_label":"M 9.5 / W 11","merchSkuId":"3c2f7021-8fc5-580d-9576-71d633be7a05","status":"ACTIVE"},{"available":true,"label":"10","localized_label":"M 10 / W 11.5","merchSkuId":"65482404-60f4-51e3-ac13-71b4c39b4bff","status":"ACTIVE"},{"available":true,"label":"10.5","localized_label":"M 10.5 / W 12","merchSkuId":"c18c3d90-476e-50ef-b003-78b5197eefa7","status":"ACTIVE"},{"available":true,"label":"11","localized_label":"M 11 / W 12.5","merchSkuId":"496eae42-d79f-52a3-9ba6-edfd3acfe5be","status":"ACTIVE"},{"available":true,"label":"11.5","localized_label":"M 11.5 / W 13","merchSkuId":"bfd47b29-5743-50dd-948f-5cfabb35e3c0","status":"ACTIVE"},{"available":true,"label":"12","localized_label":"M 12 / W 13.5","merchSkuId":"23309959-571e-5d30-9f9e-93cc2efb99be","status":"ACTIVE"},{"available":true,"label":"12.5","localized_label":"M 12.5 / W 14","merchSkuId":"11e4f82a-1674-5234-b26d-ca5625a71a48","status":"ACTIVE"},{"available":true,"label":"13","localized_label":"M 13 / W 14.5","merchSkuId":"0ac3669a-2917-57c9-9c48-16fd8bb36d7e","status":"ACTIVE"},{"available":true,"label":"14","localized_label":"M 14 / W 15.5","merchSkuId":"52b8424c-f865-5478-a335-8b62b37fcf17","status":"ACTIVE"},{"available":true,"label":"15","localized_label":"M 15 / W 16.5","merchSkuId":"86cf5fb5-52e8-59dd-b47b-e98d3f3e2a48","status":"ACTIVE"},{"available":true,"label":"16","localized_label":"M 16 / W 17.5","merchSkuId":"0feb1cf1-8846-562a-8735-ab37b2468215","status":"ACTIVE"},{"available":true,"label":"17","localized_label":"M 17 / W 18.5","merchSkuId":"4993419f-bb7b-537f-acf6-7e488a4e3dc8","status":"ACTIVE"},{"available":true,"label":"18","localized_label":"M 18 / W 19.5","merchSkuId":"1ff3b9f1-6b40-5571-9bef-93c92e0011b3","status":"ACTIVE"}],
  "color_description":"White/White","currency":"USD","current_price":115,"description":"Comfortable, durable and timeless—it’s number one for a reason. The classic ‘80s construction pairs smooth leather with bold details for style that tracks whether you’re on court or on the go.",
  "full_title":"Nike Air Force 1 '07 Men's Shoes",
  "images":[
    {"alt":"Nike Air Force 1 '07 Men's Shoes","type":"squarish","url":"https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/AIR+FORCE+1+%2707.png"},
    {"alt":"Nike Air Force 1 '07 Men's Shoes","type":"squarish","url":"https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/d0ad440c-2d9b-4a58-93a4-9e2ea050fea3/AIR+FORCE+1+%2707.png"}
  ]
};

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log("Seeding hardcoded product...");

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

  const title = apiData.full_title;
  const description = apiData.description;
  const priceStr = apiData.current_price.toString();
  const colorDesc = apiData.color_description;

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

  let colorId = "";
  const colorSlug = slugify(colorDesc);
  const existingColor = await db.select().from(colors).where(eq(colors.slug, colorSlug));
  if (existingColor.length > 0) {
    colorId = existingColor[0].id;
  } else {
    const res = await db.insert(colors).values({ name: colorDesc, slug: colorSlug, hexCode: "#FFFFFF" }).returning();
    colorId = res[0].id;
  }

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
    await db.insert(productVariants).values({
      productId,
      sku,
      price: priceStr,
      colorId,
      sizeId,
      inStock: 10,
    }).onConflictDoNothing();
  }

  const imagesData = apiData.images || [];
  let sortOrder = 0;
  for (const img of imagesData) {
    await db.insert(productImages).values({
      productId,
      url: img.url,
      sortOrder,
      isPrimary: sortOrder === 0,
    });
    sortOrder++;
  }

  console.log(`Successfully seeded ${title}`);
}

main().catch(console.error);
