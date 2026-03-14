import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import UploadFlow from "@/components/admin/upload-flow";
import { ProductFormData } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Map database product to ProductFormData
  const initialData: ProductFormData = {
    title: product.title,
    description: product.description || "",
    price: product.price,
    category_id: product.category_id || "",
    images: product.images || [],
    status: product.status,
    shipping_type: product.shipping_type,
    shipping_price: product.shipping_price,
    stock_quantity: product.stock_quantity || 1,
    is_on_sale: product.is_on_sale || false,
    compare_at_price: product.compare_at_price,
    sale_label: product.sale_label || "",
  };

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto mb-8 px-4">
        <h1 className="text-3xl font-serif font-bold">עריכת פריט</h1>
        <p className="text-muted-foreground font-sans">ערוך את פרטי המוצר הקיים</p>
      </div>
      <UploadFlow initialData={initialData} productId={id} />
    </div>
  );
}
