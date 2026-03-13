"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("פרטי התחברות שגויים");
      setLoading(false);
    } else {
      toast.success("התחברת בהצלחה");
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">ניהול החנות</h1>
          <p className="text-muted-foreground font-sans">הכנס פרטי התחברות כדי להמשיך</p>
        </div>

        <Card className="border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardDescription className="font-sans">כניסת מנהל בלבד</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6 text-right">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pr-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-sans font-semibold btn-press"
                disabled={loading}
              >
                {loading ? "מתחבר..." : "התחברות"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-xs text-muted-foreground font-sans">
          שכחת סיסמה? פנה לתמיכה הטכנית
        </p>
      </div>
    </div>
  );
}
