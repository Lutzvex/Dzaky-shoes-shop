import { Navbar, Footer } from "@/components";
import { getCurrentUser } from "@/lib/auth/actions";
import { getCartCount } from "@/lib/actions/cart";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const cartCount = await getCartCount();
  return (
    <>
      <Navbar user={user} cartCount={cartCount} />
      {children}
      <Footer />
    </>
  );
}
