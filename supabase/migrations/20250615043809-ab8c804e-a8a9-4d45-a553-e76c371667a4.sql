
-- Create the manifestation-audio storage bucket
insert into storage.buckets (id, name, public) 
values ('manifestation-audio', 'manifestation-audio', true);

-- Create policy to allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'manifestation-audio' );

-- Create policy to allow authenticated users to insert files
create policy "Allow authenticated uploads"
on storage.objects for insert
with check ( bucket_id = 'manifestation-audio' and auth.role() = 'authenticated' );
