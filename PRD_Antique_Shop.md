# Product Requirements Document (PRD): Antique & Second-Hand Mobile Store

## 1. Project Overview
A lean, mobile-first web application designed for a shop owner to manage and sell antique items efficiently. The system simplifies inventory management using AI for automatic descriptions and category matching, while providing a premium, searchable storefront for customers.

## 2. Target Audience
* **Admin:** Shop owner managing inventory on-the-go. Needs fast upload, AI assistance, and bulk image handling.
* **Customers:** Vintage enthusiasts looking for unique items. Need robust search, filtering, and direct communication (WhatsApp/Email).

## 3. Tech Stack (Updated)
* **Framework:** Next.js 16 (App Router) for high performance and SEO.
* **Styling:** Tailwind CSS + shadcn/ui for a premium, antique-themed design.
* **Database:** Supabase (PostgreSQL) with Row Level Security (RLS).
* **Storage:** Supabase Storage for high-quality product images.
* **AI:** Gemini 1.5 Flash for Vision-to-Text (automatic titles, descriptions, and category suggestions).
* **Languages:** Hebrew (RTL support throughout).

## 4. Core Features

### A. Admin Dashboard (Advanced Management)
1. **Intelligent Upload Flow:**
   - **Multi-Image Support:** Upload up to 10 images per product.
   - **AI Analysis:** Automatically generates title, description, and price based on the *first* image.
   - **Background Removal:** One-click AI-powered background removal for any uploaded image.
2. **Hierarchical Inventory:**
   - **Two-Step Categories:** Main categories and sub-categories (e.g., Books > Israeli Literature).
   - **Stock Control:** Manage quantities (defaults to 1 for unique antiques).
3. **Flexible Editing:** Full "Edit" capability from the dashboard or inventory list, including updating images, categories, and availability status.
4. **Shop Settings & SEO:** 
   - Manage contact information (WhatsApp, Email, Phone).
   - **Hero Customization:** Edit the homepage's main titles and description directly from Admin.
   - **Dynamic Metadata:** The site's browser tab title and Open Graph metadata automatically sync with the "Shop Name".

### B. Customer Storefront (Premium Experience)
1. **Search & Discovery:**
   - **Autocomplete Search:** Real-time search suggestions as you type.
   - **Hierarchical Filtering:** Filter by main categories and dive deep into sub-categories.
2. **Product Gallery:** Interactive gallery to view all product images with smooth transitions.
3. **Inquiry System:** Dynamic "Interested" buttons that generate WhatsApp/Email messages with full product context (title, price, link).

## 5. Database Schema
- **categories:** `id, name, slug, parent_id (self-relation), sort_order`
- **products:** `id, title, description, price, images (text array), stock_quantity, shipping_type, shipping_price, category_id, status (published/sold/draft), views`
- **shop_settings:** `id, shop_name, whatsapp_number, email_address, phone_number, hero_title_part1, hero_title_part2, hero_description`

## 6. Implementation Principles
- **Cost-Efficiency:** Maximum use of free tiers (Gemini, Supabase, Vercel).
- **Mobile-First:** 100% of admin and customer UI is optimized for touch and small screens.
- **RTL Integrity:** Every component is designed for Hebrew readability.