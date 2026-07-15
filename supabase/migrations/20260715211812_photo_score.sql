-- Add score column to public.photos
alter table public.photos add column if not exists score numeric(4,2);

-- Add score column to public.albums
alter table public.albums add column if not exists score numeric(4,2);

-- Create or replace trigger function to update album average score
create or replace function public.update_album_score()
returns trigger as $$
declare
  v_album_id uuid;
  v_avg_score numeric(4,2);
begin
  -- Set album_id depending on the operation
  if (tg_op = 'DELETE') then
    v_album_id := old.album_id;
  else
    v_album_id := new.album_id;
  end if;

  -- Calculate average score of photos in the album (ignoring null/0 scores depending on preference, but here we just ignore null)
  select round(coalesce(avg(score), 0), 2) into v_avg_score
  from public.photos
  where album_id = v_album_id and score is not null;

  -- Update the album's score
  update public.albums
  set score = v_avg_score
  where id = v_album_id;

  return null;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists trigger_update_album_score on public.photos;

create trigger trigger_update_album_score
after insert or update of score or delete
on public.photos
for each row
execute function public.update_album_score();
