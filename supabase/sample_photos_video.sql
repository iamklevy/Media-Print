-- Sample uploads can be a photo or a short video clip, up to 25MB
-- (SAMPLE_MAX_BYTES / SAMPLE_MIME_EXT in lib/orders/actions.ts).
update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm']
where id = 'sample-photos';
