import { createClient } from "@/lib/supabase/server";
import StorefrontHeader from "@/components/storefront/header";
import CategoryFilter from "@/components/storefront/category-filter";
import ProductCard from "@/components/storefront/product-card";
import { Category, Product } from "@/lib/types";

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

      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">חנות עתיקות</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              מקום לאוהבי יופי של פעם, עיצוב עם נשמה וסיפורים מאחורי חפצים. 
              אנחנו עושים כבוד להיסטוריה ומביאים אותה לבית המודרני.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider">קטגוריות</h4>
            <ul className="space-y-2">
              {(categories as Category[]).slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <a href={`/?category=${cat.slug}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold mb-4 text-sm uppercase tracking-wider">צרו קשר</h4>
            <p className="text-muted-foreground text-sm mb-4 italic">
              זמינים לכל שאלה בוואטסאפ או בטלגרם.
            </p>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              className="inline-flex items-center justify-center px-6 py-2 bg-whatsapp text-white rounded-lg hover:brightness-95 transition-all font-sans font-medium"
            >
              וואטסאפ של החנות
            </a>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground font-mono">
          &copy; {new Date().getFullYear()} Antique Shop. Built with Soul & AI
        </div>
      </footer>
    </div>
  );
}
