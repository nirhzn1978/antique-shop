"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, Sparkles, X, Loader2, Wand2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { removeBackground } from "@imgly/background-removal";
import { toast } from "sonner";

interface ImageUploadProps {
  onImagesUploaded: (urls: string[], firstBase64?: string) => void;
  values: string[];
}

/**
 * ImageUpload - A powerful component for handling multiple product images.
 * Features:
 * - Multi-image grid display
 * - Sequential upload for better error handling
 * - Base64 extraction on the first image for Gemini AI analysis
 * - AI-powered background removal for individual images
 */
export default function ImageUpload({ onImagesUploaded, values }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [removingBgId, setRemovingBgId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      let firstBase64: string | undefined = undefined;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. If it's the first image ever uploaded (values is empty), get base64 for AI
        if (values.length === 0 && i === 0) {
          firstBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
          });
        }

        // 2. Upload to storage
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const { url, error } = await res.json();
        if (error) throw new Error(error);
        newUrls.push(url);
      }
      
      onImagesUploaded([...values, ...newUrls], firstBase64);
      toast.success(`${files.length} תמונות הועלו בהצלחה`);
    } catch (err: any) {
      toast.error(err.message || "שגיאה בהעלאת התמונות");
    } finally {
      setUploading(false);
      // Clear input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onImagesUploaded(newValues);
  };

  const handleRemoveBackground = async (url: string, index: number) => {
    setRemovingBgId(url);
    const toastId = toast.loading("מסיר רקע... (עשוי לקחת כמה שניות)");
    
    try {
      const resultBlob = await removeBackground(url);
      const file = new File([resultBlob], "no-bg.png", { type: "image/png" });
      
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const { url: newUrl, error } = await res.json();
      if (error) throw new Error(error);
      
      const newValues = [...values];
      newValues[index] = newUrl;
      onImagesUploaded(newValues);
      toast.success("הרע הוסר בהצלחה", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("נכשל בהסרת רקע", { id: toastId });
    } finally {
      setRemovingBgId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {values.map((url, index) => (
          <div key={url} className="aspect-[4/5] relative rounded-2xl overflow-hidden border border-border group bg-card">
            <Image src={url} alt={`Product ${index}`} fill className="object-cover" />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] gap-1 bg-white text-black border-none hover:bg-white/90"
                onClick={() => handleRemoveBackground(url, index)}
                disabled={removingBgId === url}
              >
                {removingBgId === url ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                הסר רקע
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-sans">
                תמונה ראשית
              </div>
            )}
          </div>
        ))}

        {/* Upload Buttons */}
        <label className={cn(
          "aspect-[4/5] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer bg-muted/30 hover:bg-muted/50",
          uploading ? "opacity-50 cursor-not-allowed" : "border-border hover:border-primary/30"
        )}>
          <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-2 shadow-sm">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
          </div>
          <span className="text-xs font-medium font-sans text-center">גלריה</span>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={handleUpload} 
            disabled={uploading} 
          />
        </label>

        <label className={cn(
          "aspect-[4/5] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer bg-muted/30 hover:bg-muted/50",
          uploading ? "opacity-50 cursor-not-allowed" : "border-border hover:border-primary/30"
        )}>
          <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-2 shadow-sm">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Camera className="w-6 h-6 text-muted-foreground" />}
          </div>
          <span className="text-xs font-medium font-sans text-center">מצלמה</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={handleUpload} 
            disabled={uploading} 
          />
        </label>
      </div>
    </div>
  );
}
