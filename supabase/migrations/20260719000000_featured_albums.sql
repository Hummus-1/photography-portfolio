-- Add is_featured column to public.albums table if it doesn't exist
ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false NOT NULL;

-- Recreate albums_with_locations view to include is_featured
DROP VIEW IF EXISTS public.albums_with_locations;

CREATE VIEW public.albums_with_locations AS
SELECT 
  a.*,
  public.get_location_path(a.location_id) as location_path
FROM public.albums a;
