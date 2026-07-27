-- Add lat and lng columns to public.locations table
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lat numeric(9,6);
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS lng numeric(9,6);

-- Update get_location_path function to include lat and lng coordinates in json output
CREATE OR REPLACE FUNCTION public.get_location_path(loc_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_path jsonb;
BEGIN
  IF loc_id IS NULL THEN
    RETURN NULL;
  END IF;

  WITH RECURSIVE location_hierarchy AS (
    SELECT id, name, type, parent_id, lat, lng, 1 as depth
    FROM public.locations
    WHERE id = loc_id
    
    UNION ALL
    
    SELECT l.id, l.name, l.type, l.parent_id, l.lat, l.lng, lh.depth + 1
    FROM public.locations l
    INNER JOIN location_hierarchy lh ON l.id = lh.parent_id
  )
  SELECT jsonb_agg(
    jsonb_build_object('id', id, 'name', name, 'type', type, 'lat', lat, 'lng', lng) 
    ORDER BY depth DESC
  )
  INTO v_path
  FROM location_hierarchy;
  
  RETURN v_path;
END;
$$ LANGUAGE plpgsql STABLE;
