import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const API = process.env.API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async rewrites() {
    return [{ source: "/v1/media/:path*", destination: `${API}/v1/media/:path*` }];
  },
};

export default withNextIntl(nextConfig);
