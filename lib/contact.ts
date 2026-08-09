export const SALES_PHONE = "01005750973";
export const ADMIN_PHONE = "01070226790";
export const ADMIN_PHONE_2 = "01114537488";
export const EMAIL = "mediaprint.egypt@gmail.com";
export const EMAIL_MARKETING = "marketing.mediaprint@gmail.com";
export const FACEBOOK = "https://www.facebook.com/mediaprint.pack";
export const ADDRESS_EN = "323 Sudan Street, Mohandessin, Giza";

/** Deep link to any number's WhatsApp thread with a prefilled message. */
export const waLinkTo = (phone: string, text: string) =>
  `https://wa.me/20${phone}?text=${encodeURIComponent(text)}`;

/** Every form in the site hands off to the same sales line. */
export const waLink = (text: string) => waLinkTo(SALES_PHONE, text);
