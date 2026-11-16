-- Minimum order quantities are now 300 pieces for clothing packaging and
-- 1,000 for everything else, so the quote form offers a new 300_500 range
-- (clothing only) and no longer offers 100_500. 100_500 stays accepted here
-- so older orders that carry it can still be edited from the ops dashboard.

create or replace function enforce_quantity_range()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' or new.quantity is distinct from old.quantity)
     and new.quantity not in ('100_500', '300_500', '500_1000', '1000_5000', '5000_10000', '10000_plus') then
    raise exception 'orders.quantity must be one of the fixed quantity ranges, got: %', new.quantity;
  end if;
  return new;
end;
$$;
