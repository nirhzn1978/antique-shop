"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar from "@/components/admin/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session && pathname === "/admin/login") {
        router.push("/admin");
      }
      
      setLoading(false);
    };

    checkUser();
  }, [supabase, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 bg-card border-l border-border hidden md:block">
          <div className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background font-sans" dir="rtl">
      {/* Desktop Sidebar */}
      <AdminSidebar className="hidden md:flex" />
      
      <main className="flex-1 md:pr-64">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold italic">עתיקה</span>
          </Link>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-xl border border-border/10">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="right" className="p-0 w-72 h-full border-none shadow-2xl">
              <AdminSidebar 
                className="flex w-full h-full border-none shadow-none" 
                isMobile 
                onItemClick={() => setIsMobileMenuOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
