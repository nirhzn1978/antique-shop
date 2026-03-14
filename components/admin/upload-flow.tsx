"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2,
  Package,
  Info,
  DollarSign,
  Truck,
  ImageIcon,
  Tag,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "./image-upload";
import { Category, ProductFormData } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadFlowProps {
  initialData?: ProductFormData;
  productId?: string;
}

/**
 * UploadFlow - A multi-step form for creating or editing products.
 * Handles:
 * 1. Image upload (multi-image)
 * 2. AI analysis (via Gemini)
 * 3. Categorization (including hierarchical sub-categories)
 * 4. Pricing & Shipping details
 */
export default function UploadFlow({ initialData, productId }: UploadFlowProps) {
  const router = useRouter();
  
  // step 1: Images, step 2: Details, step 3: Pricing/Shipping
  const [step, setStep] = useState(1); 
  
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Main form state
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (initialData) return initialData;
    return {
      title: "",
      description: "",
      price: 0,
      category_id: "",
      images: [],
      status: "published",
      shipping_type: "pickup",
      shipping_price: null,
      stock_quantity: 1,
      is_on_sale: false,
      compare_at_price: null,
      sale_label: "",
    };
  });

  // Base64 version of the first image, used for AI analysis
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  /**
   * Invokes the Gemini AI analysis on the primary image (imageBase64).
   * Automatically populates title, description, and suggested price.
   * Also attempts to find a matching category from the available list.
   */
  const handleAnalyze = async () => {
    if (!imageBase64) return;
    
    setAnalyzing(true);
    const toastId = toast.loading("ה-AI מנתח את התמונה...");
    
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      
      const suggestion = await res.json();
      
      if (suggestion.error) throw new Error(suggestion.error);

      // Robust Category Matching
      const matchedCategory = categories.find(c => {
        const name = c.name.toLowerCase();
        const suggested = suggestion.category.toLowerCase();
        return name.includes(suggested) || suggested.includes(name);
      });

      console.log("AI Suggestion:", suggestion);
      console.log("Matched Category:", matchedCategory);

      setFormData(prev => ({
        ...prev,
        title: suggestion.title,
        description: suggestion.description,
        price: suggestion.suggestedPrice || prev.price,
        category_id: matchedCategory?.id || prev.category_id
      }));

      toast.success("הניתוח הושלם!", { id: toastId });
      setStep(2);
    } catch (err) {
      toast.error("נכשל בניתוח התמונה. נסה שוב או מלא ידנית.", { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Submits the product data to the database.
   * Handles both creating new products (POST) and updating existing ones (PUT).
   */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      // Ensure category_id defaults to "Other" (find by slug or name if possible, or just default to the ID if we have it)
      const otherCategory = categories.find(c => c.name === "אחר" || c.slug === "other");
      const finalFormData = {
        ...formData,
        category_id: formData.category_id || otherCategory?.id || ""
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      if (!res.ok) throw new Error("נכשל בשמירת המוצר");
      
      toast.success(productId ? "המוצר עודכן בהצלחה!" : "המוצר פורסם בהצלחה!");
      router.push("/admin");
    } catch (err) {
      toast.error("שגיאה בשמירת המוצר");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "תמונה", icon: ImageIcon },
    { title: "פרטים", icon: Info },
    { title: "מחיר ומשלוח", icon: DollarSign },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              step > i + 1 ? "bg-primary text-primary-foreground" : 
              step === i + 1 ? "bg-primary text-primary-foreground scale-110 shadow-lg" : 
              "bg-muted text-muted-foreground"
            )}>
              {step > i + 1 ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2 transition-all duration-500",
                step > i + 1 ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      <Card className="border-border/50 shadow-xl overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-serif font-bold">
                  {productId ? "ניהול תמונות" : "צילום הפריט"}
                </h2>
                <p className="text-muted-foreground font-sans">
                  {productId 
                    ? "הוסף או הסר תמונות מהפריט (הראשונה היא הראשית)" 
                    : "העלה תמונה ברורה לקבלת תוצאות טובות יותר מה-AI"}
                </p>
              </div>
              
              <ImageUpload 
                values={formData.images}
                onImagesUploaded={(urls, firstBase64) => {
                  setFormData(prev => ({ ...prev, images: urls }));
                  if (firstBase64) {
                    setImageBase64(firstBase64);
                  }
                }}
              />

              <div className="pt-4">
                {!productId ? (
                  <>
                    <Button 
                      className="w-full h-14 text-lg font-sans font-bold gap-2 btn-press shadow-lg shadow-primary/20"
                      disabled={formData.images.length === 0 || analyzing}
                      onClick={handleAnalyze}
                    >
                      {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      נתח תמונה עם AI והמשך
                    </Button>
                    <button 
                      className="w-full mt-4 text-muted-foreground hover:text-foreground text-sm font-sans"
                      onClick={() => setStep(2)}
                      disabled={formData.images.length === 0}
                    >
                      דלג על ניתוח ומלא ידנית
                    </button>
                  </>
                ) : (
                  <Button 
                    className="w-full h-14 text-lg font-sans font-bold gap-2 btn-press shadow-lg shadow-primary/20"
                    onClick={() => setStep(2)}
                  >
                    <Check className="w-5 h-5" />
                    המשך לעריכת פרטים
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold">פרטי הפריט</h2>
                <p className="text-muted-foreground font-sans text-sm">בדוק וערוך את המידע שה-AI הפיק</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>שם הפריט</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="למשל: כד נחושת עתיק מהמאה ה-19"
                    className="font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="ספר על הפריט, המצב שלו וההיסטוריה..."
                    rows={5}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>קטגוריה ראשית</Label>
                    <Select 
                      value={(() => {
                        const current = categories.find(c => c.id === formData.category_id);
                        return current?.parent_id || formData.category_id || "";
                      })()}
                      onValueChange={val => setFormData(prev => ({ ...prev, category_id: val }))}
                    >
                      <SelectTrigger className="w-full h-12 text-right" dir="rtl">
                        <SelectValue placeholder="בחר קטגוריה">
                          {categories.find(c => c.id === (categories.find(curr => curr.id === formData.category_id)?.parent_id || formData.category_id))?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => !c.parent_id).map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(() => {
                    const current = categories.find(c => c.id === formData.category_id);
                    const parentId = current?.parent_id || formData.category_id;
                    const subs = categories.filter(c => c.parent_id === parentId);
                    
                    if (subs.length === 0) return null;

                    return (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label>תת קטגוריה (אופציונלי)</Label>
                        <Select 
                          value={current?.parent_id ? formData.category_id : "none"}
                          onValueChange={val => setFormData(prev => ({ 
                            ...prev, 
                            category_id: val === "none" ? parentId : val 
                          }))}
                        >
                          <SelectTrigger className="w-full h-12 text-right" dir="rtl">
                            <SelectValue placeholder="בחר תת קטגוריה">
                              {current?.parent_id ? current.name : "כללי (בלי תת קטגוריה)"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">כללי (בלי תת קטגוריה)</SelectItem>
                            {subs.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <Label>כמות במלאי</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.stock_quantity} 
                    onChange={e => setFormData(prev => ({ ...prev, stock_quantity: Math.max(1, Number(e.target.value)) }))}
                    className="font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 h-12 gap-2" onClick={() => setStep(1)}>
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </Button>
                <Button className="flex-1 h-12 gap-2" onClick={() => setStep(3)}>
                  המשך לתמחור
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold">מחיר ומשלוח</h2>
                <p className="text-muted-foreground font-sans text-sm">איך הלקוח יקבל את הפריט?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>מחיר מבוקש (₪)</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="text-2xl font-mono font-bold"
                  />
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className={cn("w-5 h-5", formData.is_on_sale ? "text-primary" : "text-muted-foreground")} />
                      <Label className="text-base font-bold cursor-pointer" htmlFor="sale-toggle">האם הפריט במבצע?</Label>
                    </div>
                    <button 
                      id="sale-toggle"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        is_on_sale: !prev.is_on_sale,
                        ...(prev.is_on_sale ? { compare_at_price: null, sale_label: "" } : {})
                      }))}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                        formData.is_on_sale ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                        formData.is_on_sale ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  {formData.is_on_sale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label>מחיר לפני הנחה (₪)</Label>
                        <Input 
                          type="number" 
                          value={formData.compare_at_price || ""} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setFormData(prev => {
                              const discount = val > prev.price ? Math.round(((val - prev.price) / val) * 100) : 0;
                              return { 
                                ...prev, 
                                compare_at_price: val,
                                sale_label: discount > 0 ? `${discount}% הנחה` : prev.sale_label
                              };
                            });
                          }}
                          placeholder="0"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>תווית מבצע (חופשי)</Label>
                        <Input 
                          value={formData.sale_label || ""} 
                          onChange={e => setFormData(prev => ({ ...prev, sale_label: e.target.value }))}
                          placeholder="למשל: 20% הנחה"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>אפשרויות משלוח</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'pickup', label: 'איסוף עצמי בלבד', icon: Package },
                      { id: 'free', label: 'משלוח חינם', icon: Check },
                      { id: 'paid', label: 'משלוח בתשלום', icon: Truck },
                    ].map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setFormData(prev => ({ ...prev, shipping_type: opt.id as any }))}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                          formData.shipping_type === opt.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <opt.icon className={cn("w-5 h-5", formData.shipping_type === opt.id ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-sans font-medium">{opt.label}</span>
                        </div>
                        {formData.shipping_type === opt.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    ))}
                  </div>

                  {formData.shipping_type === 'paid' && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <Label>עלות משלוח (₪)</Label>
                      <Input 
                        type="number" 
                        value={formData.shipping_price || 0} 
                        onChange={e => setFormData(prev => ({ ...prev, shipping_price: Number(e.target.value) }))}
                        placeholder="הכנס עלות משלוח"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 h-12 gap-2" onClick={() => setStep(2)}>
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </Button>
                <Button 
                  className="flex-1 h-12 gap-2 shadow-lg shadow-primary/20" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Check className="w-4 h-4" />}
                  {productId ? "שמור שינויים" : "פרסם פריט לחנות"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
