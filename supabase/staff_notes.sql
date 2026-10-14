-- Internal staff notes on an order: free text the team keeps updating from the
-- ops order sheet. Never shown to the customer (stripped by
-- lib/orders/customer-view.ts before an order reaches the tracking page).

alter table orders add column staff_notes text;
