-- Drop the view first to prevent column mismatch errors in Postgres
drop view if exists public.albums_with_locations;

-- Recreate the view to pick up the new score column from public.albums
create view public.albums_with_locations as
select 
  a.*,
  public.get_location_path(a.location_id) as location_path
from public.albums a;
