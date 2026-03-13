import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/products — public, filterable by category slug
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("categories.slug", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter client-side when joining on category slug
  const filtered =
    category && category !== "all"
      ? data?.filter((p) => p.categories?.slug === category)
      : data;

  return NextResponse.json(filtered ?? []);
}

// POST /api/products — admin only
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from("products")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
