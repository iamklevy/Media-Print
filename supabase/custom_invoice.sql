-- Replace auto-generated invoices with staff-uploaded ones. Ops now attaches
-- their own invoice file per order (instead of the pdf-lib-rendered one),
-- shown on the order detail sheet and the customer tracking page.

alter table orders add column invoice_file jsonb;

-- No new Storage bucket needed: reuses the existing public "artwork-files"
-- bucket (10MB cap), written under an "invoices/" prefix so it never
-- collides with staff artwork proofs ("{orderId}/{slot}-...") or customer
-- uploads ("customer/...").
