-- Lead time should count from the moment the customer approves the sample,
-- not from order creation; artwork approval gets the same file-exchange
-- treatment sample approval already has.

alter table orders add column lead_time_started_at timestamptz;
alter table orders add column artwork_files jsonb not null default '[]';

-- Also create a public Storage bucket named "artwork-files" in the Supabase
-- dashboard (same settings as the existing "sample-photos" bucket) — bucket
-- creation isn't scriptable from here.
