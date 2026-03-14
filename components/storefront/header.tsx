"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Phone, Mail, MessageCircle, MapPin, X } from "lucide-react";
import SearchBar from "./search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StorefrontHeader() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data));
  }, []);

  const shopName = settings?.shop_name || "חנות עתיקות";
  const whatsappNumber = settings?.whatsapp_number;
  const phoneNumber = settings?.phone_number;
  const emailAddress = settings?.email_address;
  const wazeUrl = settings?.waze_url;
  const googleMapsUrl = settings?.google_maps_url;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              {shopName}
            </span>
          </Link>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <SearchBar />
          </div>

          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              קטלוג
            </Link>

            <Dialog>
              <DialogTrigger className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                צור קשר
              </DialogTrigger>
              <DialogContent className="sm:max-w-md font-sans rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif text-center mb-4 border-b pb-4">יצירת קשר</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  {whatsappNumber && (
                    <Button
                      variant="outline"
                      className="h-16 justify-start px-6 gap-4 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all rounded-2xl group"
                      onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-emerald-700">WhatsApp</span>
                        <span className="text-xs text-emerald-600/70">שלחו לנו הודעה עכשיו</span>
                      </div>
                    </Button>
                  )}

                  {phoneNumber && (
                    <Button
                      variant="outline"
                      className="h-16 justify-start px-6 gap-4 border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all rounded-2xl group"
                      onClick={() => window.location.href = `tel:${phoneNumber}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-blue-700">שיחה טלפונית</span>
                        <span className="text-xs text-blue-600/70">{phoneNumber}</span>
                      </div>
                    </Button>
                  )}

                  {emailAddress && (
                    <Button
                      variant="outline"
                      className="h-16 justify-start px-6 gap-4 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all rounded-2xl group"
                      onClick={() => window.location.href = `mailto:${emailAddress}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-slate-700">דואר אלקטרוני</span>
                        <span className="text-xs text-slate-600/70">{emailAddress}</span>
                      </div>
                    </Button>
                  )}

                  {wazeUrl && (
                    <Button
                      variant="outline"
                      className="h-16 justify-start px-6 gap-4 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all rounded-2xl group"
                      onClick={() => window.open(wazeUrl, "_blank")}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-emerald-700">Waze</span>
                        <span className="text-xs text-emerald-600/70">נווטו עם Waze</span>
                      </div>
                    </Button>
                  )}

                  {googleMapsUrl && (
                    <Button
                      variant="outline"
                      className="h-16 justify-start px-6 gap-4 border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all rounded-2xl group"
                      onClick={() => window.open(googleMapsUrl, "_blank")}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="font-bold text-blue-700">Google Maps</span>
                        <span className="text-xs text-blue-600/70">נווטו עם Google Maps</span>
                      </div>
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </nav>
        </div>
      </div>
    </header>
  );
}
