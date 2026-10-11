-- Let customers attach their design file(s) directly on the "Get a quote"
-- form, before the order has reached the artwork_pre_press phase. Kept as
-- its own column (not merged into `artwork_files`) because `artwork_files`
-- holds staff-prepared proofs shown back to the customer for approval at the
-- artwork_approved gate — mixing the customer's original source file into
-- that same slot-based array would make the approval gate show the
-- customer their own upload as if it were a proof to sign off on.

alter table orders add column customer_artwork_files jsonb not null default '[]';

-- No new Storage bucket needed: the existing "artwork-files" bucket is
-- already public, has no mime-type restriction, and allows files up to
-- 10MB, which comfortably covers PDF/AI/EPS design files. Customer uploads
-- are written under a "customer/" prefix in that same bucket so they never
-- collide with the staff-uploaded proof slots ("{orderId}/{slot}-...").
