-- The public quote form used to collect quantity as free text (e.g. "5,000
-- bags"), which produced enough bad data that it's now a fixed dropdown of
-- ranges instead: 100_500, 500_1000, 1000_5000, 5000_10000, 10000_plus.
--
-- Existing orders keep whatever free text they already have in `quantity` —
-- untouched, not backfilled — since it can't be reliably mapped to a range.
-- A trigger enforces the fixed set only for what changes from here on: new
-- orders, and any order whose quantity is explicitly edited (e.g. from the
-- ops dashboard). Saving unrelated fields on an old order is unaffected,
-- since the trigger only checks quantity when it's the value being changed.

create or replace function enforce_quantity_range()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' or new.quantity is distinct from old.quantity)
     and new.quantity not in ('100_500', '500_1000', '1000_5000', '5000_10000', '10000_plus') then
    raise exception 'orders.quantity must be one of the fixed quantity ranges, got: %', new.quantity;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_quantity_range_check on orders;
create trigger orders_quantity_range_check
before insert or update on orders
for each row
execute function enforce_quantity_range();
