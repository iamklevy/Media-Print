-- Price negotiation gate: two new phases between order intake and artwork
-- prep. Ops quotes a price + invoice ("quote_pending"), then the customer
-- must approve or reject it ("quote_review") before the order can advance.
-- No new columns: the existing unit_price/order_total/invoice_file columns
-- are reused as the quote itself, and rejection reasons are stored on
-- order_events (same precedent as the existing artwork/sample gates).

alter table orders drop constraint orders_phase_check;
alter table orders add constraint orders_phase_check check (phase in (
  'order_confirmed','quote_pending','quote_review','artwork_pre_press','artwork_approved',
  'sample_produced','sample_approved','plates_tooling','printing',
  'finishing_die_cut','quality_check','packed','out_for_delivery','delivered'
));
