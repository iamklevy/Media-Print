-- Order cancellation: staff can cancel an order from the ops board (and
-- reopen it later). Cancelling doesn't touch `phase` — the order keeps the
-- step it was at, so reopening puts it straight back where it left off.

alter table orders
  add column cancelled_at timestamptz,
  add column cancel_reason text;

alter table order_events drop constraint order_events_type_check;
alter table order_events add constraint order_events_type_check check (type in (
  'created','phase_change','customer_approved','customer_requested_changes',
  'note','reminder_sent','rated','cancelled','reopened'
));
