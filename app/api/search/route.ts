import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  const supabase = await createClient();

  // Search products
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("id, title, price, images")
    .ilike("title", `%${q}%`)
    .eq("status", "published")
    .limit(5);

  // Search categories
  const { data: categories, error: cError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .ilike("name", `%${q}%`)
    .limit(3);

  if (pError || cError) {
    return NextResponse.json({ error: pError?.message || cError?.message }, { status: 500 });
  }

  return NextResponse.json({
    products: products || [],
    categories: categories || []
  });
}
