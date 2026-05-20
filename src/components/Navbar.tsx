"use client";


import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/lib/auth/actions";

const NAV_LINKS = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar({ user }: { user?: { name: string; email: string; id: string } | null }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Dzaky shoes shop Home" className="flex items-center">
          <span className="text-xl font-bold tracking-tight">Dzaky shoes shop</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-body text-dark-900 transition-colors hover:text-dark-700"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <button 
            onClick={() => alert("Fitur Search sedang dalam pengembangan!")}
            className="text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            Search
          </button>
          <button 
            onClick={() => alert("Fitur Cart sedang dalam pengembangan!")}
            className="text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            My Cart (2)
          </button>
          {user ? (
            <div className="flex items-center gap-4 border-l border-light-300 pl-6">
              <span className="text-body text-dark-900">Hi, {user.name}</span>
              <button 
                onClick={async () => { await signOut(); window.location.href = '/'; }}
                className="text-body text-dark-900 transition-colors hover:text-dark-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-light-300 pl-6">
              <Link href="/sign-in" className="text-body text-dark-900 transition-colors hover:text-dark-700">
                Sign In
              </Link>
              <Link href="/sign-up" className="rounded-md bg-dark-900 px-4 py-2 text-body text-light-100 transition-colors hover:bg-dark-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="mb-1 block h-0.5 w-6 bg-dark-900"></span>
          <span className="block h-0.5 w-6 bg-dark-900"></span>
        </button>
      </nav>

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
          <li className="flex items-center justify-between pt-2 border-t border-light-300 mt-2">
            <button onClick={() => alert("Fitur Search sedang dalam pengembangan!")} className="text-body py-2 hover:text-dark-700">Search</button>
            <button onClick={() => alert("Fitur Cart sedang dalam pengembangan!")} className="text-body py-2 hover:text-dark-700">My Cart (2)</button>
          </li>
          {user ? (
            <li className="flex items-center justify-between pt-2 border-t border-light-300">
              <span className="text-body text-dark-900 py-2">Hi, {user.name}</span>
              <button onClick={async () => { await signOut(); window.location.href = '/'; }} className="text-body py-2 hover:text-dark-700">Sign Out</button>
            </li>
          ) : (
            <li className="flex flex-col gap-2 pt-4 border-t border-light-300">
              <Link href="/sign-in" className="block py-2 text-body text-center text-dark-900 hover:text-dark-700">Sign In</Link>
              <Link href="/sign-up" className="block py-2 rounded-md bg-dark-900 text-center text-body text-light-100 hover:bg-dark-700">Sign Up</Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
