-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ALBUMS TABLE
create table public.albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text,
  location text,
  date date not null default current_date,
  cover_image_url text,
  is_published boolean default false not null,
  tags text[] default '{}'::text[] not null, -- Auto-synced shared tags from photos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PHOTOS TABLE
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references public.albums(id) on delete cascade not null,
  url text not null,                -- Cloudflare R2 public URL for the optimized WebP image
  thumbnail_url text,              -- Cloudflare R2 public URL for the timeline WebP thumbnail
  location text,                    -- Specific photo spot name or GPS coordinates
  width integer not null,
  height integer not null,
  aspect_ratio numeric(4,2) not null, -- width / height (used to build dynamic masonry layouts)
  sort_order integer default 0 not null,
  
  -- Metadata
  tags text[] default '{}'::text[] not null, -- AI and EXIF tags (e.g. ['glacier', 'night'])
  color_palette text[] default '{}'::text[] not null, -- 5 dominant hex codes extracted from photo

  -- EXIF metadata
  exif jsonb default '{}'::jsonb not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index photos_album_id_idx on public.photos(album_id);
create index photos_sort_order_idx on public.photos(sort_order);
create index albums_slug_idx on public.albums(slug);

-- Enable Row Level Security (RLS)
alter table public.albums enable row level security;
alter table public.photos enable row level security;

-- Policies for public reading
create policy "Public Select Albums"
  on public.albums for select
  using (is_published = true);

create policy "Public Select Photos"
  on public.photos for select
  using (
    exists (
      select 1 from public.albums
      where albums.id = photos.album_id and albums.is_published = true
    )
  );

-- Policies for Admin uploads (Authenticated users)
create policy "Admin Albums"
  on public.albums for all
  to authenticated
  using (true);

create policy "Admin Photos"
  on public.photos for all
  to authenticated
  using (true);

-- Create trigger function to update album tags based on photos
create or replace function public.update_album_tags()
returns trigger as $$
declare
  v_album_id uuid;
  v_total_photos integer;
  v_common_tags text[];
begin
  -- Set album_id depending on the operation
  if (tg_op = 'DELETE') then
    v_album_id := old.album_id;
  else
    v_album_id := new.album_id;
  end if;

  -- Count total photos in the album
  select count(*) into v_total_photos 
  from public.photos 
  where album_id = v_album_id;

  if (v_total_photos = 0) then
    -- No photos, reset tags to empty
    update public.albums 
    set tags = '{}'::text[] 
    where id = v_album_id;
  else
    -- Calculate common tags: tags that appear in >= 50% of the photos (min 2 if multiple photos)
    select coalesce(array_agg(tag), '{}'::text[]) into v_common_tags
    from (
      select unnest(tags) as tag, count(*) as occur
      from public.photos
      where album_id = v_album_id
      group by tag
    ) sub
    where occur >= case 
      when v_total_photos = 1 then 1
      else greatest(2, ceil(v_total_photos::float / 2))
    end;

    update public.albums 
    set tags = v_common_tags 
    where id = v_album_id;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- Create trigger on photos table
create trigger trigger_update_album_tags
after insert or update or delete
on public.photos
for each row
execute function public.update_album_tags();
