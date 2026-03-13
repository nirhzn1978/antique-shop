"use client";

import { useEffect, useState } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Loader2, 
  Hash,
  GripVertical,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/lib/types";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [parentCatId, setParentCatId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCatName.trim(),
          parent_id: parentCatId === "none" ? null : parentCatId
        }),
      });

      if (!res.ok) throw new Error("נכשל בהוספת קטגוריה");
      
      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setNewCatName("");
      setParentCatId(null);
      toast.success("קטגוריה נוספה בהצלחה");
    } catch (err) {
      toast.error("שגיאה בהוספת הקטגוריה");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${name}"? פריטים המשויכים אליה יישארו ללא קטגוריה.`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("נכשל במחיקה");
      
      setCategories(categories.filter(c => c.id !== id));
      toast.success("הקטגוריה נמחקה");
    } catch (err) {
      toast.error("שגיאה במחיקה (יתכן שישנם פריטים המקושרים לקטגוריה זו)");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">ניהול קטגוריות</h1>
        <p className="text-muted-foreground font-sans">ארגן את הפריטים שלך לפי קטגוריות נוחות לחיפוש</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Category Form */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-serif">הוספת קטגוריה חדשה</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">שם הקטגוריה</Label>
                  <div className="relative">
                    <Type className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="catName"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="למשל: רהיטים, כלי נחושת..."
                      className="pr-10 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>קטגוריית אם (אופציונלי)</Label>
                  <Select 
                    value={parentCatId || "none"}
                    onValueChange={val => setParentCatId(val)}
                  >
                    <SelectTrigger className="w-full h-11 font-sans text-right" dir="rtl">
                      <SelectValue placeholder="בחר קטגוריית אם">
                        {parentCatId === "none" || !parentCatId ? "ללא (קטגוריה ראשית)" : categories.find(c => c.id === parentCatId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">ללא (קטגוריה ראשית)</SelectItem>
                      {categories.filter(c => !c.parent_id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button                   type="submit" 
                  className="w-full gap-2 font-sans btn-press h-11"
                  disabled={isAdding || !newCatName.trim()}
                >
                  {isAdding ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  הוסף קטגוריה
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-serif font-semibold">רשימת קטגוריות</h2>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-muted-foreground font-sans">טוען קטגוריות...</span>
              </div>
            ) : (
              <div className="divide-y divide-border/50 font-sans">
                {categories.filter(c => !c.parent_id).map((parent) => (
                  <div key={parent.id} className="divide-y divide-border/30">
                    {/* Parent Category */}
                    <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold block text-lg">{parent.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">/{parent.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => deleteCategory(parent.id, parent.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {categories.filter(sub => sub.parent_id === parent.id).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 pr-12 hover:bg-muted/5 transition-colors group bg-muted/5">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-medium block">{sub.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">/{sub.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => deleteCategory(sub.id, sub.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Orphan categories (shouldn't happen with strict logic but good for safety) */}
                {categories.filter(c => c.parent_id && !categories.some(p => p.id === c.parent_id)).map(orphan => (
                  <div key={orphan.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold block">{orphan.name} (יתום)</span>
                        <span className="text-xs text-muted-foreground font-mono">/{orphan.slug}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteCategory(orphan.id, orphan.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && !loading && (
                  <div className="py-12 text-center text-muted-foreground">
                    טרם הוגדרו קטגוריות בחנות.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "secondary" | "outline", className?: string }) {
  const styles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
