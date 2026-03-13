import type { Metadata } from "next";
import { Playfair_Display, Assistant, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * generateMetadata allows us to fetch shop settings from the database
 * and apply them to the site's title and SEO configurations.
 */
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("shop_settings")
    .select("shop_name")
    .single();

  const shopName = settings?.shop_name || "חנות עתיקות";

  return {
    title: {
      default: shopName,
      template: `%s | ${shopName}`,
    },
    description: "פריטי וינטג׳ ועתיקות ייחודיים — מוצאים אצלנו פנינים שמחכות לבית חדש",
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: shopName,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${playfair.variable} ${assistant.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
