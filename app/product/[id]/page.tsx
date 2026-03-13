import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import StorefrontHeader from "@/components/storefront/header";
import ShareButton from "@/components/storefront/share-button";
import ProductGallery from "@/components/storefront/product-gallery";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("title, description, images").eq("id", id).single();
  
  if (!product) return { title: "הפריט לא נמצא" };

  return {
    title: product.title,
    description: product.description?.slice(0, 160) || "פריט עתיק ייחודי בחנות שלנו",
    openGraph: {
      title: product.title,
      description: product.description || "",
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

const shippingLabel: Record<string, string> = {
  pickup: "איסוף עצמי בלבד",
  free: "משלוח חינם לכל הארץ",
  paid: "משלוח בתשלום (תיאום טלפוני)",
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .single();

  const { data: settings } = await supabase
    .from("shop_settings")
    .select("*")
    .single();

  if (!product) notFound();

  const typedProduct = product as Product;
  const imageUrl = typedProduct.images?.[0] ?? "/placeholder.jpg";
  
  // Fallback to env if DB settings are empty
  const whatsappNumber = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const shopName = settings?.shop_name || process.env.NEXT_PUBLIC_SHOP_NAME || "חנות העתיקות";
  const emailAddress = settings?.email_address;
  
  const whatsappMessage = encodeURIComponent(
    `היי, ראיתי את הפריט "${typedProduct.title}" (מחיר: ₪${typedProduct.price.toLocaleString()}) באתר ${shopName} ומאוד אהבתי! האם הוא עדיין זמין?`
  );

  const emailSubject = encodeURIComponent(`התעניינות בפריט: ${typedProduct.title}`);
  const emailBody = encodeURIComponent(
    `שלום,\n\nאני מתעניין בפריט הבא שראיתי באתר ${shopName}:\n\n` +
    `שם הפריט: ${typedProduct.title}\n` +
    `מחיר: ₪${typedProduct.price.toLocaleString()}\n` +
    `קישור: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${typedProduct.id}\n\n` +
    `אשמח לקבל פרטים נוספים.\nתודה!`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">החנות</Link>
          <ChevronRight className="w-3 h-3" />
          <span>{typedProduct.categories?.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <ProductGallery 
            images={typedProduct.images} 
            title={typedProduct.title} 
            isSold={typedProduct.status === 'sold'} 
          />

          {/* Product Info */}
          <div className="flex flex-col h-full py-4">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs font-mono py-1">
                  {typedProduct.categories?.name}
                </Badge>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground font-semibold leading-tight">
                  {typedProduct.title}
                </h1>
                <p className="font-mono text-2xl text-primary font-bold">
                  ₪{typedProduct.price.toLocaleString('he-IL')}
                </p>
              </div>

              <div className="border-y border-border/50 py-6">
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line font-sans">
                  {typedProduct.description || "אין תיאור לפריט זה."}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">אופן קבלה:</span>
                  <span className="font-medium text-foreground">{shippingLabel[typedProduct.shipping_type]}</span>
                </div>
                {typedProduct.shipping_price && typedProduct.shipping_price > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">עלות משלוח:</span>
                    <span className="font-mono font-medium text-foreground">₪{typedProduct.shipping_price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 space-y-3">
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] hover:brightness-95 text-white font-sans font-bold text-lg rounded-2xl shadow-lg shadow-green-500/20"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">WA</span>
                </div>
                <span>דברו איתנו ב-WhatsApp</span>
              </a>

              {emailAddress && (
                <a 
                  href={`mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`}
                  className="btn-press flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground font-sans font-bold text-lg rounded-2xl shadow-lg shadow-primary/20"
                >
                  <Mail className="w-5 h-5" />
                  <span>שלחו לנו אימייל</span>
                </a>
              )}

              {settings?.phone_number && (
                <a 
                  href={`tel:${settings.phone_number}`}
                  className="flex items-center justify-center gap-2 w-full py-3 text-foreground/70 hover:text-foreground transition-all font-sans font-medium"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>התקשרו: {settings.phone_number}</span>
                </a>
              )}
              
              <ShareButton 
                title={typedProduct.title} 
                description={typedProduct.description || ""} 
              />
            </div>
          </div>
        </div>

        {/* Similar Items (Future addition) */}
      </main>
    </div>
  );
}
