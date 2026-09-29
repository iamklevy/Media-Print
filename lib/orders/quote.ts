/**
 * Name of the hidden honeypot input on the quote form. Humans never see it;
 * spam bots that fill every field do, and createOrderFromQuote drops those
 * submissions. Deliberately not a name browsers autofill (e.g. "website").
 */
export const QUOTE_HONEYPOT_FIELD = "mp_ref_code";
