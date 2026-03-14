"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { 
  Package, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  Loader2,
  Filter,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStats(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    
    setProducts(data || []);
    setLoading(false);
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
      fetchStats();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("שגיאה במחיקת הפריט");
    } else {
      toast.success("הפריט נמחק");
      fetchStats();
    }
  };

  const stats = [
    { title: "סה״כ מוצרים", value: products.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "צפיות", value: products.reduce((acc, p) => acc + (p.views || 0), 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "פריטים שנמכרו", value: products.filter(p => p.status === 'sold').length, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  let filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category_id === activeCategory;
    const matchesStatus = activeStatus === "all" || p.status === activeStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "views") return (b.views || 0) - (a.views || 0);
    return 0;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">לוח בקרה</h1>
          <p className="text-muted-foreground font-sans">ניהול החנות והמלאי שלך</p>
        </div>
        <Link href="/admin/add">
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium btn-press">
            <Plus className="w-5 h-5" />
            <span>הוספת פריט חדש</span>
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`border-none shadow-sm ${stat.bg}/30 ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl scale-90 md:scale-100 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-xl md:text-2xl font-mono font-bold">{stat.value}</div>
              </div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product List Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">ניהול מלאי</h2>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="md:hidden flex gap-2 rounded-xl">
                    <Filter className="w-4 h-4" />
                    סינון
                  </Button>
                }
              />
              <SheetContent side="bottom" className="rounded-t-[32px] h-[80vh] p-6 font-sans">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-right font-serif">סינון ומיון</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 text-right" dir="rtl">
                  <div className="space-y-3">
                    <label className="text-sm font-bold">חיפוש חופשי</label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="חפש לפי שם..." 
                        className="pr-10 h-12 rounded-xl"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold">קטגוריה</label>
                    <Select value={activeCategory} onValueChange={(val) => val && setActiveCategory(val)}>
                      <SelectTrigger className="h-12 rounded-xl" size="default">
                        <SelectValue placeholder="כל הקטגוריות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הקטגוריות</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold">מיון לפי</label>
                    <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
                      <SelectTrigger className="h-12 rounded-xl" size="default">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">חדש ביותר</SelectItem>
                        <SelectItem value="oldest">ישן ביותר</SelectItem>
                        <SelectItem value="price-high">מחיר (גבוה לנמוך)</SelectItem>
                        <SelectItem value="price-low">מחיר (נמוך לגבוה)</SelectItem>
                        <SelectItem value="views">הכי נצפה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold">סטטוס</label>
                    <div className="flex gap-2">
                      {['all', 'published', 'sold', 'draft'].map((s) => (
                        <Button
                          key={s}
                          variant={activeStatus === s ? 'default' : 'outline'}
                          className="flex-1 rounded-xl h-10 text-xs"
                          onClick={() => setActiveStatus(s)}
                        >
                          {s === 'all' ? 'הכל' : s === 'published' ? 'פעיל' : s === 'sold' ? 'מכור' : 'טיוטה'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full h-12 rounded-xl mt-6 text-lg font-bold" onClick={() => setIsFilterOpen(false)}>
                    החל סינון
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="חפש מוצר..." 
                className="pr-10 bg-background border-none shadow-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={activeCategory} onValueChange={(val) => val && setActiveCategory(val)}>
              <SelectTrigger className="w-48 bg-background border-none shadow-none" size="default">
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeStatus} onValueChange={(val) => val && setActiveStatus(val)}>
              <SelectTrigger className="w-36 bg-background border-none shadow-none" size="default">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="published">פעיל</SelectItem>
                <SelectItem value="sold">מכור</SelectItem>
                <SelectItem value="draft">טיוטה</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
              <SelectTrigger className="w-44 bg-background border-none shadow-none" size="default">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">חדש ביותר</SelectItem>
                <SelectItem value="oldest">ישן ביותר</SelectItem>
                <SelectItem value="price-high">מחיר מהיקר</SelectItem>
                <SelectItem value="price-low">מחיר מהזול</SelectItem>
                <SelectItem value="views">הכי נצפה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm font-sans">מעבד נתונים...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-muted/20 rounded-3xl border-2 border-dashed border-border/50 py-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Package className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-sans">לא נמצאו פריטים העונים לחיפוש...</p>
            <Button variant="link" onClick={() => { setSearch(""); setActiveCategory("all"); setActiveStatus("all"); }} className="mt-2">
              איפוס מסננים
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile Cards Redesign */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card rounded-2xl border border-border/50 p-3 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/5">
                    <Image 
                      src={product.images?.[0] || "/placeholder.jpg"} 
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    {product.is_on_sale && (
                      <div className="absolute top-1 right-1 z-10">
                        <Badge className="bg-red-600 text-[8px] h-4 px-1 border-none shadow-sm">
                          {product.sale_label || "מבצע"}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 cursor-pointer" onClick={() => router.push(`/admin/edit/${product.id}`)}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm line-clamp-2 leading-tight flex-1">
                        {product.title}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1 -mt-1 rounded-full hover:bg-muted shrink-0">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-sans w-48 rounded-xl shadow-xl border-none">
                          <DropdownMenuItem onClick={() => window.open(`/product/${product.id}`, "_blank")} className="py-3">
                            <ExternalLink className="w-4 h-4 ml-3 text-blue-500" /> צפה פריט באתר
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="py-3">
                            <Link href={`/admin/edit/${product.id}`} className="flex items-center">
                              <Edit className="w-4 h-4 ml-3 text-amber-500" /> עריכת פרטי מוצר
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(product.id, product.status)} className="py-3">
                            <Package className="w-4 h-4 ml-3 text-emerald-500" /> סימון כ{product.status === 'published' ? 'נמכר' : 'פעיל'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive py-3" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4 ml-3" /> מחיקת פריט לצמיתות
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-lg font-mono font-bold text-primary">₪{product.price.toLocaleString()}</span>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {product.views || 0} צפיות
                          </div>
                          <span className="opacity-30">|</span>
                          <span className="truncate max-w-[80px]">{(product as any).categories?.name}</span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={product.status === 'published' ? 'default' : product.status === 'sold' ? 'secondary' : 'outline'} 
                        className="text-[10px] px-2 py-0 h-5 rounded-lg"
                      >
                        {product.status === 'published' ? 'פעיל' : product.status === 'sold' ? 'מכור' : 'טיוטה'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 font-sans text-sm font-semibold text-muted-foreground">מוצר</th>
                    <th className="px-6 py-4 font-sans text-sm font-semibold text-muted-foreground">מחיר</th>
                    <th className="px-6 py-4 font-sans text-sm font-semibold text-muted-foreground">סטטוס</th>
                    <th className="px-6 py-4 font-sans text-sm font-semibold text-muted-foreground">צפיות</th>
                    <th className="px-6 py-4 font-sans text-sm font-semibold text-muted-foreground">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/admin/edit/${product.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <Image src={product.images?.[0] || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                            {product.is_on_sale && (
                              <div className="absolute top-0 right-0 z-10">
                                <Badge className="bg-red-600 text-[7px] p-0 h-3 w-3 flex items-center justify-center border-none" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm line-clamp-1">{product.title}</span>
                              {product.is_on_sale && (
                                <Badge variant="outline" className="text-[9px] text-red-600 border-red-600/30 bg-red-50 py-0 h-4">מבצע</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{(product as any).categories?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm cursor-pointer" onClick={() => router.push(`/admin/edit/${product.id}`)}>
                        <div className="flex flex-col">
                          {product.is_on_sale && product.compare_at_price && (
                            <span className="text-[10px] text-muted-foreground line-through opacity-50">₪{product.compare_at_price.toLocaleString()}</span>
                          )}
                          <span className={cn(product.is_on_sale ? "text-red-600 font-bold" : "")}>₪{product.price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/admin/edit/${product.id}`)}>
                        <Badge 
                          variant={product.status === 'published' ? 'default' : product.status === 'sold' ? 'secondary' : 'outline'}
                          className="text-[11px]"
                        >
                          {product.status === 'published' ? 'פעיל' : product.status === 'sold' ? 'נמכר' : 'טיוטה'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm cursor-pointer" onClick={() => router.push(`/admin/edit/${product.id}`)}>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          {product.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-sans">
                            <DropdownMenuItem onClick={() => window.open(`/product/${product.id}`, "_blank")}>
                              <ExternalLink className="w-4 h-4 ml-2" /> צפה באתר
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/edit/${product.id}`} className="flex items-center">
                                <Edit className="w-4 h-4 ml-2" /> ערוך מוצר
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(product.id, product.status)}>
                              <Package className="w-4 h-4 ml-2" /> שנה ל{product.status === 'published' ? 'נמכר' : 'פעיל'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4 ml-2" /> מחק פריט
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
