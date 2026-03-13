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
          {product.status === "sold" && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
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
            <p className="font-mono text-primary font-semibold text-base md:text-lg">
              ₪{product.price.toLocaleString("he-IL")}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {shippingLabel[product.shipping_type]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
