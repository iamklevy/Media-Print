-- Customer email: required on new quote submissions, used to send
-- transactional emails (quote received, artwork/sample ready for review).
-- Nullable at the DB level so existing orders aren't broken by this
-- migration; the quote form enforces it as required going forward.

alter table orders
  add column customer_email text,
  add column locale text not null default 'ar' check (locale in ('ar', 'en'));
