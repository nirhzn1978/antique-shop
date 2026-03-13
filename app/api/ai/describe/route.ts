import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeProductImage } from "@/lib/gemini";

// POST /api/ai/describe
// Body: { imageBase64: string }
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageBase64 } = await request.json();

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  try {
    const suggestion = await analyzeProductImage(imageBase64);
    return NextResponse.json(suggestion);
  } catch (err: any) {
    console.error("Detailed Gemini API Error:", {
      message: err.message,
      stack: err.stack,
      raw: err
    });
    return NextResponse.json(
      { error: err.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
