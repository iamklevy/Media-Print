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
  allowedDevOrigins: ["192.168.1.161"],
};

export default withNextIntl(nextConfig);
