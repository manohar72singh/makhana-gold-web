import type { NextConfig } from "next";

// Prevent worker thread explosion on high-core cloud servers (e.g. 64-core Hostinger containers)
process.env.NEXT_PRIVATE_MAX_WORKERS = process.env.NEXT_PRIVATE_MAX_WORKERS || "2";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb", "@prisma/client", "bcryptjs"],
  experimental: {
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

// Reload trigger: schema updated with isHotDeal and isBestSeller
export default nextConfig;

