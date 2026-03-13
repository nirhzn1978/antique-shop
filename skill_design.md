# Antique Shop Design Skill

## Overview

Design system and implementation guide for a mobile-first digital antique and vintage shop with dual interfaces: customer storefront and admin dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RTL Hebrew)
- **Database**: Supabase (Auth + Storage + PostgreSQL)
- **AI**: Google Gemini (image description, price suggestions)
- **Styling**: Tailwind CSS + shadcn/ui
- **Contact**: WhatsApp Business API / Direct Link

---

## Color Palette (5 Colors Only)

```css
:root {
  /* Primary Colors */
  --background: 40 33% 94%;           /* #F5F1EB - Antique Cream */
  --foreground: 30 14% 9%;            /* #1A1814 - Deep Brown-Black */
  --primary: 30 25% 44%;              /* #8B7355 - Antique Gold-Brown */
  --primary-foreground: 40 33% 94%;   /* #F5F1EB */
  
  /* Surface Colors */
  --card: 40 33% 98%;                 /* #FDFCFA - Warm White */
  --card-foreground: 30 14% 9%;
  --popover: 40 33% 98%;
  --popover-foreground: 30 14% 9%;
  
  /* UI Colors */
  --border: 35 20% 87%;               /* #E5E0D8 - Soft Beige */
  --input: 35 20% 87%;
  --ring: 30 25% 44%;
  
  /* Semantic Colors */
  --muted: 35 15% 90%;
  --muted-foreground: 30 10% 45%;
  --accent: 35 15% 90%;
  --accent-foreground: 30 14% 9%;
  --secondary: 35 15% 90%;
  --secondary-foreground: 30 14% 9%;
  
  /* Status Colors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  
  /* Special */
  --whatsapp: 142 70% 45%;            /* #25D366 - WhatsApp Green */
  
  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 30 14% 9%;
  --foreground: 40 33% 94%;
  --card: 30 12% 12%;
  --card-foreground: 40 33% 94%;
  --primary: 35 30% 55%;
  --primary-foreground: 30 14% 9%;
  --border: 30 12% 20%;
  --muted: 30 12% 15%;
  --muted-foreground: 35 15% 65%;
}
```

---

## Typography

### Font Configuration (layout.tsx)

```tsx
import { Playfair_Display, Assistant, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Apply to body
<body className={`${playfair.variable} ${assistant.variable} ${inter.variable} font-sans`}>
```

### Tailwind Config

```js
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],    // Assistant - Body text
  serif: ['var(--font-serif)', 'Georgia', 'serif'],          // Playfair - Headings
  mono: ['var(--font-mono)', 'monospace'],                   // Inter - Numbers/Prices
}
```

### Usage Rules

| Element | Font | Class | Weight |
|---------|------|-------|--------|
| Main headings (h1, h2) | Playfair Display | `font-serif` | 500-700 |
| Body text (Hebrew) | Assistant | `font-sans` | 400-500 |
| Prices, numbers | Inter | `font-mono` | 500 |
| Buttons, labels | Assistant | `font-sans` | 500-600 |

---

## Layout Structure

### RTL Configuration

```tsx
// layout.tsx
<html lang="he" dir="rtl">
```

### Responsive Grid

```tsx
// Product Grid - Storefront
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</div>
```

### Container Widths

```tsx
// Main content container
<main className="container mx-auto px-4 max-w-7xl">

// Narrow content (forms, details)
<div className="max-w-2xl mx-auto">
```

---

## Component Specifications

### Product Card (Storefront)

```tsx
interface ProductCardProps {
  id: string
  image: string
  title: string
  price: number
  category: string
}

// Styling
<div className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
  <div className="aspect-[4/5] relative overflow-hidden">
    <Image src={image} alt={title} fill className="object-cover" />
  </div>
  <div className="p-3 md:p-4">
    <h3 className="font-serif text-base md:text-lg text-foreground line-clamp-2">{title}</h3>
    <p className="font-mono text-primary font-medium mt-1">₪{price}</p>
  </div>
</div>
```

### Category Chips

```tsx
<div className="flex flex-wrap gap-2 justify-center">
  {categories.map(cat => (
    <button
      key={cat.id}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {cat.name}
    </button>
  ))}
</div>
```

### WhatsApp Contact Button

```tsx
<a
  href={`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium rounded-lg transition-colors"
>
  <WhatsAppIcon className="w-5 h-5" />
  <span>מעוניין? דבר איתנו</span>
</a>
```

### Admin Upload Button (Mobile)

```tsx
<button className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex flex-col items-center gap-2 transition-colors">
  <CameraIcon className="w-8 h-8" />
  <span className="font-medium text-lg">הוסף פריט חדש</span>
</button>
```

### Progress Steps (Admin Upload Flow)

```tsx
<div className="flex items-center justify-center gap-2 mb-6">
  {[1, 2, 3].map(step => (
    <div
      key={step}
      className={cn(
        "h-2 rounded-full transition-all",
        step <= currentStep ? "bg-primary w-12" : "bg-muted w-8"
      )}
    />
  ))}
</div>
```

---

## Page Structures

### Storefront Home

```
Header:
  - Logo (right/start)
  - Navigation: Categories | About | Contact
  
Hero Section:
  - Large heading: font-serif, text-4xl md:text-6xl
  - Subheading: font-sans, text-muted-foreground
  - Optional: Featured image or carousel

Category Filter:
  - Horizontal scrollable chips
  - "All" option always first

Product Grid:
  - 2 cols mobile, 3 cols tablet, 4 cols desktop
  - gap-4 md:gap-6

Footer:
  - Contact info
  - WhatsApp link
  - Social links
```

### Product Detail Page

```
Back Navigation:
  - "← חזרה לחנות"

Image Gallery:
  - Main image (aspect-[4/5] or aspect-square)
  - Thumbnail strip if multiple images

Product Info:
  - Title: font-serif text-2xl md:text-3xl
  - Price: font-mono text-xl text-primary
  - Description: font-sans text-muted-foreground
  - Category badge
  - Shipping info

Action:
  - WhatsApp button (full width on mobile)
```

### Admin Dashboard

```
Header:
  - Greeting: "שלום, [name]"
  - Settings icon

Primary Action:
  - Large "Add Item" button
  - Camera icon + text

Items List:
  - Thumbnail + title + price
  - Edit/Delete actions
  - Status badge (published/draft)

Quick Stats (optional):
  - Total items
  - Views this week
  - Inquiries
```

### Admin Add Item Flow

```
Step 1 - Photo:
  - Camera capture button
  - Gallery picker
  - Image preview
  - Tip text

Step 2 - Description:
  - AI suggestion button (prominent)
  - Title input
  - Description textarea
  - Category selector

Step 3 - Pricing:
  - Price input with ₪ prefix
  - AI price suggestion (optional)
  - Shipping options (radio)
  - Share to Facebook checkbox
  - Publish button
```

---

## Database Schema (Supabase)

```sql
-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  images TEXT[] NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'sold')),
  shipping_type TEXT DEFAULT 'pickup' CHECK (shipping_type IN ('pickup', 'free', 'paid')),
  shipping_price DECIMAL(10,2),
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries (optional)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  source TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## AI Integration (Gemini)

### Image Description Generation

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProductDescription(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `
    אתה מומחה לעתיקות ופריטי וינטג'. נתח את התמונה וספק:
    1. שם מוצר קצר ומדויק (עד 10 מילים)
    2. תיאור מפורט הכולל: תקופה משוערת, חומרים, מצב, מאפיינים ייחודיים
    3. קטגוריה מתאימה מתוך: רהיטים, פליז, ספרים, תכשיטים, אמנות, כלי בית, אחר
    
    החזר JSON בפורמט:
    {
      "title": "...",
      "description": "...",
      "category": "...",
      "suggestedPrice": number | null
    }
  `
  
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
  ])
  
  return JSON.parse(result.response.text())
}
```

---

## Animation & Interaction

### Transitions

```css
/* Standard transition */
.transition-standard {
  @apply transition-all duration-200 ease-out;
}

/* Card hover */
.card-hover {
  @apply hover:shadow-md hover:scale-[1.02] transition-all duration-200;
}

/* Button press */
.button-press {
  @apply active:scale-[0.98] transition-transform duration-100;
}
```

### Loading States

```tsx
// Skeleton for product card
<div className="animate-pulse">
  <div className="aspect-[4/5] bg-muted rounded-lg" />
  <div className="p-4 space-y-2">
    <div className="h-4 bg-muted rounded w-3/4" />
    <div className="h-4 bg-muted rounded w-1/4" />
  </div>
</div>
```

---

## Accessibility

- All interactive elements have focus-visible states
- Images have descriptive alt text (AI-generated or manual)
- Color contrast meets WCAG AA standards
- Touch targets minimum 44x44px on mobile
- Screen reader announcements for dynamic content

---

## File Structure

```
app/
├── (storefront)/
│   ├── page.tsx              # Home/catalog
│   ├── product/[id]/page.tsx # Product detail
│   └── layout.tsx            # Storefront layout
├── admin/
│   ├── page.tsx              # Dashboard
│   ├── add/page.tsx          # Add item flow
│   ├── edit/[id]/page.tsx    # Edit item
│   └── layout.tsx            # Admin layout
├── api/
│   ├── products/route.ts     # CRUD operations
│   ├── upload/route.ts       # Image upload
│   └── ai/describe/route.ts  # Gemini integration
├── layout.tsx                # Root layout (fonts, RTL)
└── globals.css               # Design tokens

components/
├── storefront/
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── category-filter.tsx
│   ├── whatsapp-button.tsx
│   └── header.tsx
├── admin/
│   ├── upload-flow.tsx
│   ├── item-list.tsx
│   ├── image-upload.tsx
│   └── ai-suggest-button.tsx
└── ui/                       # shadcn components
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY=

# Contact
NEXT_PUBLIC_WHATSAPP_NUMBER=972XXXXXXXXX
NEXT_PUBLIC_SHOP_NAME=
```
