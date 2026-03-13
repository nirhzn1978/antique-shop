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
  Search
} from "lucide-react";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

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
    { title: "סה״כ מוצרים", value: products.length, icon: Package, color: "text-blue-500" },
    { title: "צפיות", value: products.reduce((acc, p) => acc + (p.views || 0), 0), icon: TrendingUp, color: "text-green-500" },
    { title: "פריטים שנמכרו", value: products.filter(p => p.status === 'sold').length, icon: MessageSquare, color: "text-purple-500" },
  ];

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity / Items List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-serif font-semibold">פריטים אחרונים</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="חפש לפי שם או תיאור..." 
              className="pr-10 bg-card border-border/50 shadow-sm font-sans"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <div className="min-w-[700px] md:min-w-full inline-block align-middle">
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
                {filteredProducts.slice(0, 10).map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative rounded-md overflow-hidden bg-muted">
                          <Image 
                            src={product.images?.[0] || "/placeholder.jpg"} 
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm line-clamp-1">{product.title}</span>
                          <span className="text-xs text-muted-foreground">{(product as any).categories?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">₪{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={product.status === 'published' ? 'default' : product.status === 'sold' ? 'secondary' : 'outline'}
                        className="text-[11px]"
                      >
                        {product.status === 'published' ? 'פעיל' : product.status === 'sold' ? 'נמכר' : 'טיוטה'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
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
                            <ExternalLink className="w-4 h-4 ml-2" />
                            צפה באתר
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/edit/${product.id}`} className="flex items-center">
                              <Edit className="w-4 h-4 ml-2" />
                              ערוך מוצר
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(product.id, product.status)}>
                            <Package className="w-4 h-4 ml-2" />
                            שנה ל{product.status === 'published' ? 'נמכר' : 'פעיל'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4 ml-2" />
                            מחק פריט
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-sans">
                      לא נמצאו פריטים...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
