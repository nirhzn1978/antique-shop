"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  isSold?: boolean;
}

/**
 * ProductGallery - An interactive image gallery for the product detail page.
 * Features:
 * - Smooth switching between images via thumbnails
 * - "נמכר" (Sold) overlay for clarity
 * - Responsive layout optimizing for mobile devices
 */
export default function ProductGallery({ images, title, isSold }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-muted border border-border/50">
        <Image src="/placeholder.jpg" alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-[4/5] relative rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm group bg-muted/20">
        {/* Background Blur for aspect ratio safety */}
        <Image 
          src={images[activeIndex]} 
          alt=""
          fill 
          className="object-cover blur-2xl opacity-20 scale-110"
        />
        
        <Image 
          src={images[activeIndex]} 
          alt={`${title} - image ${activeIndex + 1}`}
          fill 
          priority
          className="object-contain transition-transform duration-500 group-hover:scale-105 p-4"
        />
        
        {isSold && (
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-primary-foreground font-serif text-3xl font-bold uppercase tracking-widest">נמכר</span>
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none justify-center lg:justify-start">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-muted/20",
                activeIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/30"
              )}
            >
              <Image 
                src={img} 
                alt={`${title} thumbnail ${idx + 1}`} 
                fill 
                className="object-contain p-1" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
