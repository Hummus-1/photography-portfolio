-- Add description column to public.photos
alter table public.photos add column if not exists description text;
