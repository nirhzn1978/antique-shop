"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  description?: string;
}

export default function ShareButton({ title, description }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window === "undefined") return;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: description || "",
        url: window.location.href,
      }).catch(() => {
        // Handle share cancellation or error silently
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("הקישור הועתק!");
    }
  };

  return (
    <button 
      className="flex items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-foreground transition-all font-sans text-sm"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
      <span>שתף פריט זה</span>
    </button>
  );
}
