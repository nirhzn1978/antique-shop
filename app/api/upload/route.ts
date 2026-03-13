import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/upload
// Body: FormData with field "file"
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${user.id}/${Date.now()}.${ext}`;

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.storage
    .from("product-images")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = adminClient.storage.from("product-images").getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
