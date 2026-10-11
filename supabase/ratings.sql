-- Post-delivery star rating: customer rates the order once, staff can see it
-- on the ops board (per-order and as an average across all rated orders).

alter table orders
  add column rating int check (rating between 1 and 5),
  add column rating_comment text,
  add column rated_at timestamptz;

alter table order_events drop constraint order_events_type_check;
alter table order_events add constraint order_events_type_check check (type in (
  'created','phase_change','customer_approved','customer_requested_changes',
  'note','reminder_sent','rated'
));
