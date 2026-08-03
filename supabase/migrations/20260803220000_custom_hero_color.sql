-- Add custom_hero_color column to public.albums table
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS custom_hero_color TEXT;

-- Recreate public.albums_with_locations view to expose custom_hero_color
DROP VIEW IF EXISTS public.albums_with_locations;

CREATE VIEW public.albums_with_locations AS
SELECT 
  a.*,
  public.get_location_path(a.location_id) AS location_path
FROM public.albums a;
