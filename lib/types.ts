export type ShippingType = "pickup" | "free" | "paid";
export type ProductStatus = "draft" | "published" | "sold";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category_id: string | null;
  images: string[];
  status: ProductStatus;
  shipping_type: ShippingType;
  shipping_price: number | null;
  views: number;
  created_at: string;
  updated_at: string;
  stock_quantity: number;
  // Joined
  categories?: Category;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category_id: string | null;
  images: string[];
  status: ProductStatus;
  shipping_type: ShippingType;
  shipping_price: number | null;
  stock_quantity: number;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  phone_number: string;
  whatsapp_number: string;
  email_address: string;
  hero_title_part1: string;
  hero_title_part2: string;
  hero_description: string;
  updated_at: string;
}
