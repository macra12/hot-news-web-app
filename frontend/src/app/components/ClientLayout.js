"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen bg-gray-950">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="pt-[88px] min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
