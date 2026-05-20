import { getAllCollections } from "@/lib/actions/collection";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Collections - Dzaky shoes shop",
  description: "Browse our latest shoe collections.",
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-heading-2 text-dark-900">Collections</h1>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-light-300 p-8 text-center">
          <p className="text-body text-dark-700">No collections available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-lg bg-light-300 shadow-sm transition-shadow hover:shadow-md"
            >
              {col.imageUrl ? (
                <Image
                  src={col.imageUrl}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-dark-900/10" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
              
              <div className="relative p-6">
                <h2 className="text-heading-4 text-light-100">{col.name}</h2>
                <p className="text-body text-light-300">
                  {col.productCount} {col.productCount === 1 ? 'Product' : 'Products'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
