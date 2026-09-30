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
  allowedDevOrigins: ["192.168.1.161", "172.20.10.5", "192.168.100.59"],
  // No serverActions.bodySizeLimit: files never travel through Server
  // Actions (Vercel caps function bodies at 4.5MB anyway). Uploads go from
  // the browser straight to Supabase Storage via signed URLs — see
  // createCustomerArtworkUploadUrls / createStaffUploadUrl.
};

export default withNextIntl(nextConfig);
