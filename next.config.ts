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
      // Next's server action body limit defaults to 1MB, well under the
      // SAMPLE_MAX_BYTES (5MB) uploadSampleImage already enforces — without
      // this, a 1-5MB sample photo was silently rejected by Next before our
      // own size check (or Supabase's) ever ran, logged server-side only.
      bodySizeLimit: "6mb",
    },
  },
};

export default withNextIntl(nextConfig);
