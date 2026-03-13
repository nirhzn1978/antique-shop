"use client";

import { usePathname } from "next/navigation";
import StorefrontHeader from "@/components/storefront/header";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
