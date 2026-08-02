-- Allow album date to be NULL when creating albums without specifying a date
ALTER TABLE public.albums ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.albums ALTER COLUMN date DROP DEFAULT;
