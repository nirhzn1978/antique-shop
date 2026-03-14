"use client";

import { useState, useEffect } from "react";
import { 
  Tag, 
  Percent, 
  Trash2, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ChevronLeft,
  Info,
  ExternalLink,
  Edit,
  Eye,
  Search,
  ShoppingCart,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Category } from "@/lib/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [discount, setDiscount] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [onSaleProducts, setOnSaleProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bulk' | 'active'>('bulk');

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data || []));
    
    fetchActiveSales();
  }, []);

  const fetchActiveSales = async () => {
    try {
      const res = await fetch("/api/products?status=all"); // We need full list to filter on_sale
      const data = await res.json();
      setOnSaleProducts(data.filter((p: any) => p.is_on_sale));
    } catch (err) {
      console.error("Failed to fetch active sales", err);
    }
  };

  const handleClearSingle = async (productId: string, comparePrice: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: comparePrice,
          compare_at_price: null,
          is_on_sale: false,
          sale_label: null
        }),
      });

      if (!res.ok) throw new Error("נכשל בביטול המבצע");
      
      toast.success("המבצע בוטל בהצלחה");
      fetchActiveSales();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedCategory || !discount) {
      toast.error("אנא בחר קטגוריה ואחוז הנחה");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/bulk-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          discountPercent: Number(discount),
          action: "apply"
        }),
      });

      if (!res.ok) throw new Error("נכשל בעדכון המבצע");
      
      toast.success("המבצע הוחל בהצלחה על כל המוצרים בקטגוריה!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!selectedCategory) {
      toast.error("אנא בחר קטגוריה לביטול המבצעים");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/bulk-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          action: "clear"
        }),
      });

      if (!res.ok) throw new Error("נכשל בביטול המבצעים");
      
      toast.success("כל המבצעים בקטגוריה זו בוטלו והמחירים חזרו לקדמותם");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">ניהול מבצעים והנחות</h1>
          <p className="text-muted-foreground mt-1">נהל את כל המבצעים בחנות ממקום אחד</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
              <ArrowRight className="w-4 h-4" />
              חזרה ללוח הבקרה
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl w-fit">
        <Button 
          variant={activeTab === 'bulk' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('bulk')}
          className="rounded-xl px-6"
        >
          מבצעים קבוצתיים
        </Button>
        <Button 
          variant={activeTab === 'active' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('active')}
          className="rounded-xl px-6 gap-2"
        >
          מבצעים פעילים
          {onSaleProducts.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-red-100 text-red-600 border-none">
              {onSaleProducts.length}
            </Badge>
          )}
        </Button>
      </div>

      {activeTab === 'bulk' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
        {/* Main Action Card */}
        <Card className="md:col-span-2 border-border/50 shadow-xl overflow-hidden bg-card">
          <CardHeader className="bg-primary/5 border-b border-border/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              הפעלת מבצע חדש
            </CardTitle>
            <CardDescription>בחר קטגוריה והזן את אחוז ההנחה המבוקש</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 font-sans">
                <Label className="text-base font-bold">בחר קטגוריה</Label>
                <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
                  <SelectTrigger className="h-12 rounded-xl w-full text-right" dir="rtl" size="default">
                    <SelectValue placeholder="בחר קטגוריה...">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold">אחוז ההנחה</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={discount} 
                    onChange={e => setDiscount(e.target.value)}
                    placeholder="10"
                    className="h-12 pl-10 pr-4 rounded-xl font-mono text-xl"
                  />
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-lg shadow-primary/20 btn-press"
                onClick={handleApply}
                disabled={loading || !selectedCategory}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Tag className="w-5 h-5" />}
                החל מבצע על כל המוצרים בקטגוריה
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-muted/30">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium leading-tight">המערכת תעדכן את המחירים אוטומטית ותוסיף תווית מבצע לכל פריט.</p>
            </CardHeader>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                ביטול מבצעים
              </h3>
              <p className="text-xs text-muted-foreground">האם ברצונך להחזיר את המחירים המקוריים לקטגוריה הנבחרת?</p>
              <Button 
                variant="outline" 
                className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl"
                onClick={handleClear}
                disabled={loading || !selectedCategory}
              >
                בטל את כל המבצעים בקטגוריה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onSaleProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-muted/20 border-2 border-dashed border-border/50 rounded-3xl">
                <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg">אין מבצעים פעילים כרגע</h3>
                <p className="text-muted-foreground">השתמש בתווית "מבצעים קבוצתיים" כדי להתחיל</p>
              </div>
            ) : (
              onSaleProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group">
                  <div className="relative aspect-video bg-muted">
                    <img 
                      src={product.images?.[0] || "/placeholder.jpg"} 
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-600 border-none shadow-lg">
                        {product.sale_label || "מבצע"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">₪{product.price.toLocaleString()}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through decoration-red-500/30">₪{product.compare_at_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link href={`/admin/edit/${product.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs">
                          <Edit className="w-3 h-3" />
                          עריכה
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl gap-2 text-xs border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleClearSingle(product.id, product.compare_at_price)}
                        disabled={loading}
                      >
                        <Trash2 className="w-3 h-3" />
                        ביטול
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
