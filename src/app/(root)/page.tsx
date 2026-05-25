import React from "react";
import { Card } from "@/components";
import { db } from "@/lib/db";
import { products, productImages, productVariants, brands } from "@/lib/db/schema";
import { eq, sql, desc, isNull } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
  // Fetch latest products
  const latestProducts = await db
    .select({
      id: products.id,
      name: products.name,
      brand: brands.name,
      price: sql<number>`MIN(${productVariants.price}::numeric)`,
      imageUrl: sql<string>`MAX(CASE WHEN ${productImages.isPrimary} THEN ${productImages.url} ELSE NULL END)`,
    })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(isNull(productImages.variantId))
    .groupBy(products.id, brands.name)
    .orderBy(desc(products.createdAt))
    .limit(8);

  return (
    <main className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-[80vh] min-h-[600px] bg-dark-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
           <img src="/images/nike-lookbook.png" alt="Dzaky Shoes Hero" className="w-full h-full object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4 flex flex-col items-center mt-12">
          <h1 className="text-[12vw] sm:text-[10vw] font-black uppercase text-light-100 tracking-tighter leading-none mb-6 drop-shadow-lg">
            Forever<br/>Classic
          </h1>
          <p className="text-lg sm:text-2xl text-light-300 mb-10 font-medium max-w-2xl drop-shadow-md">
            Step into the new season with the latest sneaker drops and iconic classics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="bg-light-100 text-dark-900 font-bold uppercase tracking-wider px-10 py-5 hover:bg-light-300 transition-colors text-center text-sm">
              Shop All
            </Link>
            <Link href="/collections" className="bg-transparent border-2 border-light-100 text-light-100 font-bold uppercase tracking-wider px-10 py-5 hover:bg-light-100 hover:text-dark-900 transition-colors text-center text-sm">
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
         <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 text-center text-dark-900">Shop By Category</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Men */}
            <Link href="/products?gender=men" className="group relative h-[450px] bg-light-200 overflow-hidden flex items-end p-8 border border-light-300">
               <img src="/images/men.png" alt="Shop Men" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent z-10" />
               <h3 className="text-5xl font-black uppercase text-light-100 z-20 group-hover:-translate-y-2 transition-transform duration-300">Men</h3>
            </Link>
            {/* Women */}
            <Link href="/products?gender=women" className="group relative h-[450px] bg-light-200 overflow-hidden flex items-end p-8 border border-light-300">
               <img src="/images/women.png" alt="Shop Women" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent z-10" />
               <h3 className="text-5xl font-black uppercase text-light-100 z-20 group-hover:-translate-y-2 transition-transform duration-300">Women</h3>
            </Link>
            {/* Kids */}
            <Link href="/products?gender=youth" className="group relative h-[450px] bg-light-200 overflow-hidden flex items-end p-8 border border-light-300">
               <img src="/images/kids.png" alt="Shop Kids" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent z-10" />
               <h3 className="text-5xl font-black uppercase text-light-100 z-20 group-hover:-translate-y-2 transition-transform duration-300">Kids</h3>
            </Link>
         </div>
      </section>

      {/* NEW & FEATURED */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-dark-900">New & Featured</h2>
          <Link href="/products?sort=newest" className="text-sm font-bold uppercase tracking-wider underline underline-offset-8 decoration-2 hover:text-dark-700">Shop All New</Link>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {latestProducts.map((p) => (
            <Card
              key={p.id}
              title={p.name}
              subtitle={p.brand}
              meta=""
              imageSrc={p.imageUrl || "/placeholder.png"}
              price={Number(p.price) || 120}
              href={`/products/${p.id}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
