insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cyes-nominee-photos',
  'cyes-nominee-photos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view CYES nominee photos" on storage.objects;

create policy "Public can view CYES nominee photos"
on storage.objects
for select
using (bucket_id = 'cyes-nominee-photos');
