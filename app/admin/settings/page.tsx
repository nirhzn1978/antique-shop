"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Phone, MessageSquare, Mail, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ShopSettings } from "@/lib/types";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("שגיאה בטעינת ההגדרות");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error();
      toast.success("ההגדרות עודכנו בהצלחה");
    } catch (err) {
      toast.error("שגיאה בעדכון ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">הגדרות חנות</h1>
        <p className="text-muted-foreground font-sans">נהל את פרטי הקשר ושם החנות המופיעים באתר</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-border/50 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="font-serif">פרטי התקשרות</CardTitle>
            <CardDescription className="font-sans">פרטים אלו ישמשו את הלקוחות ליצירת קשר ישירות מעמוד המוצר</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                שם החנות
              </Label>
              <Input 
                value={settings?.shop_name || ""} 
                onChange={e => setSettings(prev => prev ? { ...prev, shop_name: e.target.value } : null)}
                placeholder="למשל: עתיקות הגליל"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  טלפון לשיחות
                </Label>
                <Input 
                  value={settings?.phone_number || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                  placeholder="050-0000000"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  WhatsApp
                </Label>
                <Input 
                  value={settings?.whatsapp_number || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, whatsapp_number: e.target.value } : null)}
                  placeholder="972500000000"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  כתובת דואר אלקטרוני
                </Label>
                <Input 
                  type="email"
                  value={settings?.email_address || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, email_address: e.target.value } : null)}
                  placeholder="shop@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-emerald-600">
                  <MapPin className="w-4 h-4" />
                  קישור ל-Waze
                </Label>
                <Input 
                  value={settings?.waze_url || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, waze_url: e.target.value } : null)}
                  placeholder="https://waze.com/ul/..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-blue-600">
                  <MapPin className="w-4 h-4" />
                  קישור ל-Google Maps
                </Label>
                <Input 
                  value={settings?.google_maps_url || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, google_maps_url: e.target.value } : null)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="font-serif font-medium">תוכן עמוד הבית</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>כותרת ראשית - חלק 1</Label>
                  <Input 
                    value={settings?.hero_title_part1 || ""} 
                    onChange={e => setSettings(prev => prev ? { ...prev, hero_title_part1: e.target.value } : null)}
                    placeholder="פנינים מהעבר שמתחילות"
                  />
                </div>
                <div className="space-y-2">
                  <Label>כותרת ראשית - חלק 2 (מודגש)</Label>
                  <Input 
                    value={settings?.hero_title_part2 || ""} 
                    onChange={e => setSettings(prev => prev ? { ...prev, hero_title_part2: e.target.value } : null)}
                    placeholder="סיפור חדש אצלך"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>תיאור עמוד הבית</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={settings?.hero_description || ""} 
                    onChange={e => setSettings(prev => prev ? { ...prev, hero_description: e.target.value } : null)}
                    placeholder="אנחנו אוספים עתיקות, וינטג׳..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="font-serif font-medium">תוכן תחתית האתר (Footer)</h3>
              <div className="space-y-2">
                <Label>תיאור ב-Footer</Label>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={settings?.footer_description || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, footer_description: e.target.value } : null)}
                  placeholder="מקום לאוהבי יופי של פעם..."
                />
              </div>
              <div className="space-y-2">
                <Label>טקסט זכויות יוצרים (Copyright)</Label>
                <Input 
                  value={settings?.footer_copyright || ""} 
                  onChange={e => setSettings(prev => prev ? { ...prev, footer_copyright: e.target.value } : null)}
                  placeholder="© 2026 שאבי חנות עתיקות ויד שניה"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 gap-2 mt-4" 
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
              שמור שינויים
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
