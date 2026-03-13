---
description: How to build and deploy the Antique Shop application
---

To create a production-ready version of your shop, follow these steps:

### 1. Build the Application
This command optimizes the code, minifies CSS/JS, and prepares the application for production.
// turbo
```bash
npm run build
```

### 2. Preview the Production Build
Once the build is complete, you can test it locally to see exactly how it will perform in production.
// turbo
```bash
npm run start
```

### 3. Deployment Options

#### Option A: Vercel (Recommended)
The easiest way to publish a Next.js app.
1. Push your code to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com).
3. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.) in the Vercel dashboard.

#### Option B: Self-Hosting (Docker/Node.js)
1. Run `npm run build` on your server.
2. Ensure environmental variables are set.
3. Use a process manager like `pm2` to run `npm run start`.

> [!IMPORTANT]
> Always ensure your Supabase RLS (Row Level Security) policies are correctly configured before going live.
