import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mediaprint-eg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Lets phones/other devices on the LAN load dev assets when testing against
  // this machine's local IP instead of localhost. Dev-only; unused in prod.
  allowedDevOrigins: ["192.168.1.161", "172.20.10.5"],
  experimental: {
    serverActions: {
      // Next's server action body limit defaults to 1MB. The quote form's
      // createOrderFromQuote can carry up to 3 customer-attached design
      // files at 10MB each (CUSTOMER_ARTWORK_MAX_BYTES/_FILES in
      // lib/orders/actions.ts) inside that one call, on top of the single
      // 5MB staff photo uploads (SAMPLE_MAX_BYTES) this limit already
      // covered — without enough headroom, Next rejects the request before
      // our own size checks ever run, and the client sees only a generic
      // failure instead of a specific "file too large" message.
      bodySizeLimit: "35mb",
    },
  },
};

export default withNextIntl(nextConfig);
