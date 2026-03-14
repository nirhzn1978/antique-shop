import { Product } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const shippingLabel: Record<string, string> = {
  pickup: "איסוף עצמי",
  free: "משלוח חינם",
  paid: "משלוח בתשלום",
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] ?? "/placeholder.jpg";

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-border/50">
        {/* Image */}
        <div className="aspect-[4/5] relative overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.categories && (
            <div className="absolute top-2 end-2">
              <Badge
                variant="secondary"
                className="text-xs bg-card/80 backdrop-blur-sm"
              >
                {product.categories.name}
              </Badge>
            </div>
          )}
          {product.is_on_sale && product.status !== "sold" && (
            <div className="absolute top-2 start-2 z-10">
              <Badge
                variant="default"
                className="text-[10px] md:text-xs bg-red-600 hover:bg-red-600 text-white shadow-lg border-none animate-in fade-in zoom-in duration-300"
              >
                {product.sale_label || "מבצע"}
              </Badge>
            </div>
          )}
          {product.status === "sold" && (
            <div className="absolute inset-0 bg-foreground/50 z-20 flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-xl font-semibold backdrop-blur-sm px-4 py-2 border-2 border-primary-foreground/30 rounded-lg">
                נמכר
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <h3 className="font-serif text-sm md:text-base text-foreground line-clamp-2 leading-snug min-h-[2.5rem] md:min-h-[3rem]">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col">
              {product.is_on_sale && product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-[10px] md:text-xs text-muted-foreground line-through decoration-red-500/50 leading-none">
                  ₪{product.compare_at_price.toLocaleString("he-IL")}
                </span>
              )}
              <p className="font-mono text-primary font-bold text-base md:text-lg leading-tight">
                ₪{product.price.toLocaleString("he-IL")}
              </p>
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full">
              {shippingLabel[product.shipping_type]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
