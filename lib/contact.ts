export const SALES_PHONE = "01005750973";
export const ADMIN_PHONE = "01070226790";
export const ADMIN_PHONE_2 = "01114537488";
export const FOOTER_EMAIL = "m.mostafa@mediaprint-eg.com";
export const EMAIL_MARKETING = "marketing.mediaprint@gmail.com";
export const FACEBOOK = "https://www.facebook.com/mediaprint.pack";
export const INSTAGRAM = "https://www.instagram.com/media.print.egy/";
export const ADDRESS_EN = "323 Sudan Street, Mohandessin, Giza";

/** Display form of a local Egyptian number: 01005750973 -> +20 100 575 0973. */
export const formatPhone = (phone: string) =>
  `+20 ${phone.slice(1, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

/** Deep link to any number's WhatsApp thread with a prefilled message. */
export const waLinkTo = (phone: string, text: string) =>
  `https://wa.me/20${phone}?text=${encodeURIComponent(text)}`;
