-- Negotiation between staff and the customer often settles on an exact
-- quantity within the requested range (e.g. "400" out of the "100_500"
-- range). `quantity` stays as the customer's original ask; this new column
-- holds the exact number once staff and customer agree on it, and is what
-- drives the order-total math from then on (falling back to an estimate
-- from the low end of the range while it's still unset).

alter table orders add column confirmed_quantity integer
  check (confirmed_quantity is null or confirmed_quantity > 0);
