import { createClient } from "@/lib/supabase/server";
import StorefrontHeader from "@/components/storefront/header";
import CategoryFilter from "@/components/storefront/category-filter";
import ProductCard from "@/components/storefront/product-card";
import { Category, Product } from "@/lib/types";
import { MapPin, MessageCircle, Phone, Mail } from "lucide-react";

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const { category: activeCategory = "all", search: searchQuery } = await searchParams;
  const supabase = await createClient();

  // Fetch categories
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch products
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (activeCategory && activeCategory !== "all") {
    // Also include sub-category products if parent is selected
    const { data: catData } = await supabase.from("categories").select("id").eq("slug", activeCategory).single();
    if (catData) {
      const { data: subCats } = await supabase.from("categories").select("id").eq("parent_id", catData.id);
      const categoryIds = [catData.id, ...(subCats?.map(s => s.id) || [])];
      query = query.in("category_id", categoryIds);
    }
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: products = [] } = await query;

  // No manual filter needed now as we use exact category IDs
  const filteredProducts = (products ?? []) as Product[];

  // Fetch shop settings from the database to personalize the home page.
  // We use fallback values if the database is empty or not yet configured.
  const { data: settings } = await supabase
    .from("shop_settings")
    .select("*")
    .single();

  const heroTitlePart1 = settings?.hero_title_part1 || "פנינים מהעבר שמתחילות";
  const heroTitlePart2 = settings?.hero_title_part2 || "סיפור חדש אצלך";
  const heroDescription = settings?.hero_description || "אנחנו אוספים עתיקות, וינטג׳ ופריטי עיצוב ייחודיים שעוברים בדיקה קפדנית. כל פריט הוא אחד ויחיד.";

  return (
    <div className="min-h-screen flex flex-col">
      <StorefrontHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <section className="mb-12 space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">
            {heroTitlePart1} <br />
            <span className="text-primary italic">{heroTitlePart2}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-sans">
            {heroDescription}
          </p>
        </section>

        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-8">
          <CategoryFilter 
            categories={categories as Category[]} 
            activeSlug={activeCategory}
          />
        </section>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
            <p className="text-muted-foreground font-serif text-xl">
              לא נמצאו פריטים בקטגוריה זו כרגע...
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-16 bg-card/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Shop Info */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="font-serif text-2xl font-semibold">{settings?.shop_name || "חנות עתיקות"}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                {settings?.footer_description || "מקום לאוהבי יופי של פעם, עיצוב עם נשמה וסיפורים מאחורי חפצים. אנחנו עושים כבוד להיסטוריה ומביאים אותה לבית המודרני."}
              </p>
            </div>

            {/* Categories Link List */}
            <div className="md:col-span-2">
              <h4 className="font-sans font-semibold mb-6 text-sm uppercase tracking-widest text-foreground/70">קטגוריות</h4>
              <ul className="space-y-3">
                {(categories as Category[]).slice(0, 6).map(cat => (
                  <li key={cat.id}>
                    <a href={`/?category=${cat.slug}`} className="text-muted-foreground hover:text-primary transition-colors text-sm font-sans flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors"></span>
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map & Contact */}
            <div className="md:col-span-6 space-y-6">
              <h4 className="font-sans font-semibold text-sm uppercase tracking-widest text-foreground/70">הפינה שלנו</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                {/* Map Iframe */}
                <div className="rounded-2xl overflow-hidden border border-border/50 h-40 bg-muted relative group">
                  {settings?.google_maps_url ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.google_maps_url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <MapPin className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors pointer-events-none" />
                </div>

                {/* Contact Icons List */}
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm italic mb-2 font-sans">
                    זמינים לכל שאלה בדרכים הבאות:
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {settings?.whatsapp_number && (
                      <a 
                        href={`https://wa.me/${settings.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm font-medium hover:text-whatsapp transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-whatsapp/10 flex items-center justify-center text-whatsapp group-hover:scale-110 transition-transform">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span>WhatsApp</span>
                      </a>
                    )}
                    
                    {settings?.waze_url && (
                      <a 
                        href={settings.waze_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm font-medium hover:text-emerald-600 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>Waze (ניווט)</span>
                      </a>
                    )}

                    {settings?.google_maps_url && (
                      <a 
                        href={settings.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm font-medium hover:text-blue-600 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span>Google Maps</span>
                      </a>
                    )}

                    {settings?.phone_number && (
                      <a 
                        href={`tel:${settings.phone_number}`}
                        className="flex items-center gap-3 text-sm font-medium hover:text-slate-600 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span>{settings.phone_number}</span>
                      </a>
                    )}

                    {settings?.email_address && (
                      <a 
                        href={`mailto:${settings.email_address}`}
                        className="flex items-center gap-3 text-sm font-medium hover:text-amber-600 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="truncate">{settings.email_address}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-sans">
            <p>
              {settings?.footer_copyright || `© ${new Date().getFullYear()} ${settings?.shop_name || "Antique Shop"}`}
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">תקנון</a>
              <a href="#" className="hover:text-foreground transition-colors">מדיניות פרטיות</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
