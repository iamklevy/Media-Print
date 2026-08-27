-- Staff actions are now attributed to the logged-in Supabase Auth user's
-- display name instead of the generic "staff" actor tag.
alter table order_events add column actor_name text;
