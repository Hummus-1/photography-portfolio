-- Ensure all album table columns exist on public.albums
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS custom_hero_color TEXT;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS score NUMERIC;
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS cover_color_palette TEXT[];

-- Recreate public.albums_with_locations view so PostgREST schema cache picks up all columns
DROP VIEW IF EXISTS public.albums_with_locations;

CREATE VIEW public.albums_with_locations AS
SELECT 
  a.*,
  public.get_location_path(a.location_id) AS location_path
FROM public.albums a;
