# Stills — Premium Photography Portfolio & Blog

This is a premium, high-end photography portfolio and blog inspired by the aesthetics of [giuligartner.com](https://www.giuligartner.com/stills/visit-greenland). 

Built with **Next.js 15**, **TypeScript**, and **Tailwind CSS v4**, the application is fully integrated with a cloud media pipeline using **Supabase** (Database + Auth) and **Cloudflare R2** (Storage) to host and serve high-resolution photos efficiently and for free.

---

## Key Features

1. **Aperture Toggle Theme Switcher**: An interactive camera lens aperture SVG ring that morphs blades and spins on toggle, transitioning from F/1.4 light mode to F/22 dark mode.
2. **Subtle Film Grain**: Animated, responsive fractal noise overlay generated entirely via inline CSS-SVG.
3. **Smooth Scroll**: Native integration of Lenis smooth scroll.
4. **Asymmetric Gallery Grid**: Alternates image aspect ratios and grid sizes to produce an elegant masonry layout.
5. **Timeline Scroll Navigation**: A sticky right-aligned timeline of thumbnails. Click to jump to photos, and scroll to auto-sync the active thumbnail via `IntersectionObserver`.
6. **Interactive Image Metadata Overlays**: Hovering over photos reveals:
   - Extracted EXIF camera metadata (Camera, Lens, ISO, Aperture, Shutter Speed, Focal Length).
   - 5 dominant color palette circles extracted from the image.
   - User-defined and AI-generated hashtags.
7. **Admin Panel (`/admin`)**: A secure drag-and-drop dashboard to create albums, manage publication status, and upload photos.
8. **Automatic AI Tagging Pipeline**: Photo uploads are sent to **Cloudflare Workers AI (CLIP model)** to automatically generate tags describing objects, setting, and mood.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Animations**: Lenis (Smooth Scroll), Framer Motion (Page Transitions)
- **Backend / Database / Auth**: Supabase
- **Image Storage & CDN**: Cloudflare R2
- **Image & Data Processing**: `sharp` (compression), `exifr` (EXIF data)
- **AI Classification**: Cloudflare Workers AI (`@cf/openai/clip-vit-base-patch32`)

---

## Getting Started

### 1. Database Setup
Log in to your [Supabase Dashboard](https://supabase.com), open the SQL Editor for your project, and run the schema queries found in `ARCHITECTURE.md` to set up your tables and Row Level Security (RLS) policies.

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project and paste the following template, replacing the placeholders with your actual keys (see `.env.local.example` for details):

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key

# Cloudflare R2
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-your-id.r2.dev

# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

### 3. Install Dependencies & Start Development
Execute the following commands in your terminal:

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the homepage.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to log in and upload your collections.

*Note: If your database is empty, the homepage will automatically fall back to loading 3 mock collections (Greenland, Iceland, Mongolia) with sample photos, EXIF data, and palettes, allowing you to preview the design immediately.*
