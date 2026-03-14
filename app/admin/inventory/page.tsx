"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name")
    ]);

    if (productsRes.error) {
      toast.error("שגיאה בטעינת המוצרים");
    } else {
      setProducts(productsRes.data || []);
    }
    
    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("שגיאה במחיקה");
    } else {
      toast.success("הפריט נמחק בהצלחה");
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "sold" : "published";
    const { error } = await supabase
      .from("products")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      toast.error("שגיאה בעדכון הסטטוס");
    } else {
      toast.success("הסטטוס עודכן");
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    const matchesMinPrice = minPrice === "" || p.price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === "" || p.price <= Number(maxPrice);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "views_desc") return (b.views || 0) - (a.views || 0);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">ניהול מלאי</h1>
          <p className="text-muted-foreground font-sans">צפייה, עריכה וניהול כל הפריטים בחנות</p>
        </div>
        <Link href="/admin/add">
          <Button className="font-sans btn-press gap-2 h-11 px-6">
            <Package className="w-5 h-5" />
            הוספת פריט חדש
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex bg-card p-4 rounded-2xl border border-border/50 gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="חפש לפי שם או תיאור..." 
            className="pr-10 bg-muted/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2 font-sans border-border/50">
                <Filter className="w-4 h-4" />
                סינון ומיון
              </Button>
            }
          />
          <SheetContent side="bottom" className="font-sans h-[80vh] rounded-t-3xl border-t shadow-2xl p-0 overflow-hidden flex flex-col">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 flex-shrink-0" />
            <SheetHeader className="px-6 pt-2 pb-4 border-b">
              <SheetTitle className="text-right">סינון ומיון פריטים</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">מיון לפי</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background font-sans"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">החדשים ביותר</option>
                  <option value="oldest">הישנים ביותר</option>
                  <option value="price_desc">מחיר: מהגבוה לנמוך</option>
                  <option value="price_asc">מחיר: מהנמוך לגבוה</option>
                  <option value="views_desc">הכי נצפים</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">סטטוס</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background font-sans"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">כל הסטטוסים</option>
                  <option value="published">פעיל (למכירה)</option>
                  <option value="sold">נמכר</option>
                  <option value="draft">טיוטה</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">קטגוריה</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background font-sans"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">כל הקטגוריות</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">טווח מחירים (₪)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="מ-" 
                    value={minPrice} 
                    onChange={e => setMinPrice(e.target.value)}
                    className="font-sans"
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="עד-" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)}
                    className="font-sans"
                  />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 font-sans" 
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setSortBy("newest");
                }}
              >
                נקה סינונים
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Inventory List (Mobile Cards / Desktop Table) */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-card rounded-2xl border border-border/50 py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-muted-foreground font-sans">טוען מלאי...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 py-12 text-center text-muted-foreground font-sans">
            לא נמצאו פריטים העונים לחיפוש...
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm flex gap-4">
                  <div className="w-20 h-24 relative rounded-xl overflow-hidden bg-muted border border-border/30 flex-shrink-0">
                    <Image 
                      src={p.images?.[0] || "/placeholder.jpg"} 
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm line-clamp-2 leading-tight">{p.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-sans min-w-[160px]">
                            <DropdownMenuLabel>אפשרויות</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/edit/${p.id}`} className="flex items-center">
                                <Edit className="w-4 h-4 ml-2" />
                                ערוך פרטים
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/product/${p.id}`, "_blank")}>
                              <ExternalLink className="w-4 h-4 ml-2" />
                              צפה באתר
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(p.id, p.status)}>
                              {p.status === 'published' ? (
                                <><EyeOff className="w-4 h-4 ml-2" /> סמן כנמכר</>
                              ) : (
                                <><Eye className="w-4 h-4 ml-2" /> סמן כפעיל</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => deleteProduct(p.id)}
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              מחק לצמיתות
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap gap-1 items-center">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{ (p as any).categories?.name || 'ללא' }</Badge>
                        <Badge 
                          variant={p.status === 'published' ? 'default' : p.status === 'sold' ? 'secondary' : 'outline'}
                          className="text-[10px] py-0 h-4"
                        >
                          {p.status === 'published' ? 'פעיל' : p.status === 'sold' ? 'נמכר' : 'טיוטה'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        מלאי: <span className={cn(p.stock_quantity === 0 ? "text-destructive font-bold" : "")}>{p.stock_quantity}</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-primary">₪{p.price.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">תמונה</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">שם המוצר</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">קטגוריה</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">כמות</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">מחיר</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">סטטוס</th>
                    <th className="px-6 py-4 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-sans">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-15 relative rounded-lg overflow-hidden bg-muted border border-border/30 shadow-sm">
                          <Image src={p.images?.[0] || "/placeholder.jpg"} alt={p.title} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-sm block max-w-xs truncate">{p.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {p.id.slice(0,8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-normal text-xs">{ (p as any).categories?.name || 'ללא' }</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-sm font-medium", p.stock_quantity === 0 ? "text-destructive" : "")}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-bold">₪{p.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={p.status === 'published' ? 'default' : p.status === 'sold' ? 'secondary' : 'outline'}
                          className="text-[10px]"
                        >
                          {p.status === 'published' ? 'פעיל' : p.status === 'sold' ? 'נמכר' : 'טיוטה'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-sans min-w-[160px]">
                            <DropdownMenuLabel>אפשרויות</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/edit/${p.id}`} className="flex items-center">
                                <Edit className="w-4 h-4 ml-2" /> ערוך פרטים
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/product/${p.id}`, "_blank")}>
                              <ExternalLink className="w-4 h-4 ml-2" /> צפה באתר
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(p.id, p.status)}>
                              {p.status === 'published' ? (
                                <><EyeOff className="w-4 h-4 ml-2" /> סמן כנמכר</>
                              ) : (
                                <><Eye className="w-4 h-4 ml-2" /> סמן כפעיל</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteProduct(p.id)}>
                              <Trash2 className="w-4 h-4 ml-2" /> מחק לצמיתות
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
