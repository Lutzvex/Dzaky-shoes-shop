"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, X, Heart } from "lucide-react";
import { signOut } from "@/lib/auth/actions";

const NAV_LINKS = [
  { label: "New & Featured", href: "/collections" },
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=youth" },
  { label: "Custom", href: "/products?search=custom" },
  { label: "Launch", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sort=price_asc" },
] as const;

export default function Navbar({
  user,
  cartCount = 0,
}: {
  user?: { name: string; email: string; id: string } | null;
  cartCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products?search=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Dzaky shoes shop Home" className="flex items-center">
          <span className="text-2xl font-black tracking-tighter uppercase">Dzaky Shoes</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[13px] font-bold uppercase tracking-widest text-dark-900 transition-all hover:underline underline-offset-8 decoration-2"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 md:flex">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex items-center gap-1.5 text-body text-dark-900 transition-colors hover:text-dark-700"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Favorites */}
          {user && (
            <Link
              href="/favorites"
              className="flex items-center gap-1.5 text-body text-dark-900 transition-colors hover:text-dark-700"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-dark-900 text-[11px] font-semibold text-light-100">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-light-300 pl-5">
              <span className="text-body text-dark-900">Hi, {user.name}</span>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
                className="text-body text-dark-900 transition-colors hover:text-dark-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-light-300 pl-5">
              <Link href="/sign-in" className="text-body text-dark-900 transition-colors hover:text-dark-700">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-dark-900 px-4 py-2 text-body text-light-100 transition-colors hover:bg-dark-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile buttons */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Search" className="p-2">
            <Search className="h-5 w-5 text-dark-900" />
          </button>
          {user && (
            <Link href="/favorites" className="p-2" aria-label="Favorites">
              <Heart className="h-5 w-5 text-dark-900" />
            </Link>
          )}
          <Link href="/cart" className="relative p-2">
            <ShoppingBag className="h-5 w-5 text-dark-900" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-dark-900 text-[10px] font-semibold text-light-100">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
            <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
            <span className="block h-0.5 w-6 bg-dark-900"></span>
          </button>
        </div>
      </nav>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-light-300 bg-light-100 px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-700/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full rounded-lg border border-light-300 bg-light-100 py-2.5 pl-10 pr-4 text-body text-dark-900 placeholder:text-dark-700/50 focus:outline-none focus:ring-2 focus:ring-dark-500 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="p-2 text-dark-700 hover:text-dark-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`border-t border-light-300 md:hidden ${open ? "block" : "hidden"}`}
      >
        <ul className="space-y-2 px-4 py-3">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block py-2 text-body text-dark-900 hover:text-dark-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user ? (
            <li className="flex items-center justify-between pt-2 border-t border-light-300">
              <span className="text-body text-dark-900 py-2">Hi, {user.name}</span>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
                className="text-body py-2 hover:text-dark-700"
              >
                Sign Out
              </button>
            </li>
          ) : (
            <li className="flex flex-col gap-2 pt-4 border-t border-light-300">
              <Link href="/sign-in" className="block py-2 text-body text-center text-dark-900 hover:text-dark-700">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="block py-2 rounded-md bg-dark-900 text-center text-body text-light-100 hover:bg-dark-700"
              >
                Sign Up
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
