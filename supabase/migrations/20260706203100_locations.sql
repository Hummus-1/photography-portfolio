-- 1. Create locations table
CREATE TABLE public.locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'city' | 'island' | 'region' | 'country' | 'sub-region' | 'continent'
  parent_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  iso_code text,      -- 'ES', 'IS', 'GL' (only for country type)
  alpha_3 text,       -- 'ESP', 'ISL', 'GRL' (only for country type)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (name, parent_id), -- Avoid duplicating the same sub-location under a parent
  
  -- Constraint to guarantee all locations terminate in a country -> sub-region -> continent chain
  CONSTRAINT check_parent_for_custom_locations CHECK (
    (type = 'continent' AND parent_id IS NULL) OR
    (type IN ('sub-region', 'country') AND parent_id IS NOT NULL) OR
    (type NOT IN ('continent', 'sub-region', 'country') AND parent_id IS NOT NULL)
  )
);

-- 2. Modify albums to reference locations
ALTER TABLE public.albums ADD COLUMN location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL;

-- 3. Add indexes for fast hierarchical lookups
CREATE INDEX locations_parent_id_idx ON public.locations(parent_id);
CREATE INDEX albums_location_id_idx ON public.albums(location_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- 5. Add security policies
CREATE POLICY "Public Select Locations"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Admin Locations"
  ON public.locations FOR ALL
  TO authenticated
  USING (true);

-- 6. Create Postgres function to compute location path recursively
CREATE OR REPLACE FUNCTION public.get_location_path(loc_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_path jsonb;
BEGIN
  IF loc_id IS NULL THEN
    RETURN NULL;
  END IF;

  WITH RECURSIVE location_hierarchy AS (
    -- Anchor: start from the specific location
    SELECT id, name, type, parent_id, 1 as depth
    FROM public.locations
    WHERE id = loc_id
    
    UNION ALL
    
    -- Recursive step: join parent records
    SELECT l.id, l.name, l.type, l.parent_id, lh.depth + 1
    FROM public.locations l
    INNER JOIN location_hierarchy lh ON l.id = lh.parent_id
  )
  SELECT jsonb_agg(
    jsonb_build_object('id', id, 'name', name, 'type', type) 
    ORDER BY depth DESC -- Parent first (e.g. Europe -> Spain -> Canary Islands -> ...)
  )
  INTO v_path
  FROM location_hierarchy;
  
  RETURN v_path;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Create View for albums with location path
CREATE OR REPLACE VIEW public.albums_with_locations AS
SELECT 
  a.*,
  public.get_location_path(a.location_id) as location_path
FROM public.albums a;

