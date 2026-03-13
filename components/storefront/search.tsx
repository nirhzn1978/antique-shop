"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Tag, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    products: any[];
    categories: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm" ref={menuRef} dir="rtl">
      <form onSubmit={handleSearch} className="relative group">
        <Input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="חפש פריטים, ספרים, רהיטים..."
          className="w-full pl-10 pr-12 h-11 bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/20 focus-visible:bg-card transition-all font-sans text-sm shadow-inner"
        />
        <Search className="absolute right-4 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        {loading ? (
          <Loader2 className="absolute left-4 top-3 w-5 h-5 text-primary animate-spin" />
        ) : query ? (
          <button 
            type="button"
            onClick={() => setQuery("")}
            className="absolute left-4 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results && (results.products.length > 0 || results.categories.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-4">
            {/* Categories */}
            {results.categories.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  קטגוריות
                </div>
                <div className="mt-1">
                  {results.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-sans"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  מוצרים
                </div>
                <div className="mt-1 space-y-1">
                  {results.products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-sans group"
                    >
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden border border-border/50 shadow-sm shrink-0">
                        <Image 
                          src={prod.images?.[0] || "/placeholder.jpg"} 
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{prod.title}</span>
                        <span className="text-xs text-primary font-mono font-bold">₪{prod.price.toLocaleString()}</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSearch}
            className="w-full py-3 bg-muted/50 hover:bg-muted text-xs font-sans text-muted-foreground transition-colors border-t border-border/50"
          >
            לחץ לכל התוצאות עבור "{query}"
          </button>
        </div>
      )}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
