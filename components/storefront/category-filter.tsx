"use client";

import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: Category[];
  activeSlug: string;
}

export default function CategoryFilter({
  categories,
  activeSlug,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeCategoryObject = categories.find(c => c.slug === activeSlug);
  const parentCategory = activeCategoryObject?.parent_id 
    ? categories.find(c => c.id === activeCategoryObject.parent_id)
    : activeCategoryObject;

  // Filter items to show:
  // 1. All main categories (no parent_id)
  // 2. If a parent is active, also show its children
  const mainCategories = categories.filter(c => !c.parent_id);
  const subCategories = activeCategoryObject 
    ? categories.filter(c => c.parent_id === (activeCategoryObject.parent_id || activeCategoryObject.id))
    : [];

  // Ensure "All" is only present once and main categories follow
  const items = [
    { id: "all", name: "הכל", slug: "all" },
    ...mainCategories.filter(c => c.slug !== "all")
  ];

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search"); // Clear search when filtering by category
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {items.map((cat) => {
        const isActive = activeSlug === cat.slug || activeCategoryObject?.parent_id === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.slug)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap btn-press",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
            )}
          >
            {(cat as any).icon && <span className="ml-1">{(cat as any).icon}</span>}
            {cat.name}
          </button>
        );
      })}
    </div>

    {subCategories.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-2 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
        {subCategories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.slug)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    )}
    </>
  );
}
