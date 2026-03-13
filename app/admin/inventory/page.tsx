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
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("שגיאה בטעינת המוצרים");
    } else {
      setProducts(data || []);
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

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button variant="outline" className="gap-2 font-sans border-border/50">
          <Filter className="w-4 h-4" />
          סינון
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-muted-foreground font-sans">טוען מלאי...</span>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[800px] md:min-w-full inline-block align-middle">
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
                        <Image 
                          src={p.images?.[0] || "/placeholder.jpg"} 
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
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
                      <span className={cn(
                        "text-sm font-medium",
                        p.stock_quantity === 0 ? "text-destructive" : ""
                      )}>
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
                              <>
                                <EyeOff className="w-4 h-4 ml-2" />
                                סמן כנמכר
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 ml-2" />
                                סמן כפעיל
                              </>
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
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground bg-muted/10">
                      לא נמצאו פריטים העונים לחיפוש...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
