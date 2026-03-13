"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Settings, 
  LogOut,
  ChevronLeft,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/admin/add", label: "הוספת פריט", icon: PlusCircle },
  { href: "/admin/inventory", label: "ניהול מלאי", icon: Package },
  { href: "/admin/categories", label: "קטגוריות", icon: Tag },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
];

interface AdminSidebarProps {
  className?: string;
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function AdminSidebar({ className, isMobile, onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    if (onItemClick) onItemClick();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 right-0 w-64 bg-card border-l border-border flex flex-col z-50 transition-all",
      className
    )}>
      <div className="p-6 border-b border-border">
        <Link href="/admin" onClick={onItemClick} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold">ניהול החנות</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium font-sans">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-medium font-sans">התנתקות</span>
        </button>
      </div>
    </aside>
  );
}
