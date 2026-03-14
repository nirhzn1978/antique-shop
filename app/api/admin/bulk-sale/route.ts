import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { categoryId, discountPercent, action } = await request.json();

  try {
    if (action === "apply") {
      // 1. Fetch products in category
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, price, compare_at_price, is_on_sale")
        .eq("category_id", categoryId);

      if (fetchError) throw fetchError;

      // 2. Update each product
      for (const product of products) {
        // Use original price if already on sale, otherwise current price
        const basePrice = (product.is_on_sale && product.compare_at_price) ? product.compare_at_price : product.price;
        const newPrice = Math.round(basePrice * (1 - discountPercent / 100));
        
        await supabase
          .from("products")
          .update({
            price: newPrice,
            compare_at_price: basePrice,
            is_on_sale: true,
            sale_label: `${discountPercent}% הנחה`
          })
          .eq("id", product.id);
      }
    } else if (action === "clear") {
      // 1. Fetch products in category that are on sale
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, compare_at_price")
        .eq("category_id", categoryId)
        .eq("is_on_sale", true);

      if (fetchError) throw fetchError;

      // 2. Restore prices
      for (const product of products) {
        if (product.compare_at_price) {
          await supabase
            .from("products")
            .update({
              price: product.compare_at_price,
              compare_at_price: null,
              is_on_sale: false,
              sale_label: null
            })
            .eq("id", product.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
