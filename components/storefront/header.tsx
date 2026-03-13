"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import SearchBar from "./search";

export default function StorefrontHeader() {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "חנות עתיקות";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              {shopName}
            </span>
          </Link>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <SearchBar />
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              קטלוג
            </Link>
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              צור קשר
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
