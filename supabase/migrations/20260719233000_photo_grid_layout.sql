-- Add group_id column to photos table to store row grouping identifiers
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS group_id text DEFAULT NULL;
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS grid_layout jsonb DEFAULT NULL;
